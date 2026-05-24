import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getLeads from '@salesforce/apex/EstateIQLeadController.getLeads';
import updateLeadStatus from '@salesforce/apex/EstateIQLeadController.updateLeadStatus';

export default class EstateIQAgentViewer extends LightningElement {

    @track isLoading    = true;
    @track searchTerm   = '';
    @track activeFilter = 'all';
    @track sortNewest   = true;
    @track selectedLeadId = null;
    @track _leads = [];
    _wiredResult;

    // ─── Wire ─────────────────────────────────────────────────────────────────
    @wire(getLeads)
    wiredLeads(result) {
        this._wiredResult = result;
        if (result.data) {
            this._leads = result.data.map(l => this._enrichLead(l));
            this.isLoading = false;
        } else if (result.error) {
            this.isLoading = false;
            this.showToast('Error', result.error.body?.message || 'Failed to load leads', 'error');
        }
    }

    // ─── Lead enrichment ──────────────────────────────────────────────────────
    _enrichLead(l) {
        const initials = ((l.FirstName || '')[0] || '') + ((l.LastName || '')[0] || '');
        const budget = l.Budget__c;
        const budgetFormatted = budget
            ? (budget >= 1000000 ? '$' + (budget / 1000000).toFixed(1) + 'M'
               : budget >= 1000   ? '$' + Math.round(budget / 1000) + 'K'
               : '$' + budget.toLocaleString())
            : '—';

        const d = l.CreatedDate ? new Date(l.CreatedDate) : null;
        const dateFormatted = d
            ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '—';
        const dateFullFormatted = d
            ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—';

        const cityShort = (l.Preferred_City__c || '—').split(',')[0];

        const statusMap = {
            'Open - Not Contacted': { label: 'New',       cls: 'status-badge s-new'       },
            'Working':              { label: 'Working',   cls: 'status-badge s-working'   },
            'Closed - Converted':   { label: 'Converted', cls: 'status-badge s-converted' },
            'Closed - Not Converted':{ label: 'Closed',   cls: 'status-badge s-closed'    }
        };
        const statusInfo = statusMap[l.Status] || { label: l.Status || 'New', cls: 'status-badge s-new' };

        const splitSemi = (str) =>
            (str || '').split(';').map(s => s.trim()).filter(Boolean);

        return {
            ...l,
            initials,
            budgetFormatted,
            dateFormatted,
            dateFullFormatted,
            cityShort,
            statusLabel: statusInfo.label,
            statusCls:   statusInfo.cls,
            interiorArr:  splitSemi(l.Interior_Features__c),
            outdoorArr:   splitSemi(l.Outdoor_Features__c),
            lifestyleArr: splitSemi(l.Lifestyle_Preferences__c),
            itemCls: 'lead-item' + (this.selectedLeadId === l.Id ? ' selected' : ''),
            rowCls:  'lead-row'  + (this.selectedLeadId === l.Id ? ' selected' : '')
        };
    }

    // ─── Filtered leads ───────────────────────────────────────────────────────
    get filteredLeads() {
        let leads = [...this._leads];

        // search
        const q = this.searchTerm.toLowerCase();
        if (q) {
            leads = leads.filter(l =>
                (l.FirstName + ' ' + l.LastName + ' ' + (l.Preferred_City__c || '')).toLowerCase().includes(q)
            );
        }

        // filter
        if (this.activeFilter !== 'all') {
            leads = leads.filter(l => l.Status === this.activeFilter);
        }

        // sort
        leads.sort((a, b) => {
            const da = new Date(a.CreatedDate || 0);
            const db = new Date(b.CreatedDate || 0);
            return this.sortNewest ? db - da : da - db;
        });

        // recompute selected classes
        return leads.map(l => ({
            ...l,
            itemCls: 'lead-item' + (this.selectedLeadId === l.Id ? ' selected' : ''),
            rowCls:  'lead-row'  + (this.selectedLeadId === l.Id ? ' selected' : '')
        }));
    }

    get hasLeads()     { return this.filteredLeads.length > 0; }
    get totalCount()   { return this._leads.length; }
    get filteredCount(){ return this.filteredLeads.length; }

    // ─── Selected lead ────────────────────────────────────────────────────────
    get selectedLead() {
        if (!this.selectedLeadId) return null;
        return this.filteredLeads.find(l => l.Id === this.selectedLeadId) || null;
    }

    // ─── Stats ────────────────────────────────────────────────────────────────
    get stats() {
        const leads = this._leads;
        const total    = leads.length;
        const newCount = leads.filter(l => l.Status === 'Open - Not Contacted').length;
        const budgets  = leads.filter(l => l.Budget__c).map(l => l.Budget__c);
        const avg      = budgets.length ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length) : 0;
        const avgBudget = avg >= 1000000 ? '$' + (avg / 1000000).toFixed(1) + 'M'
                        : avg >= 1000    ? '$' + Math.round(avg / 1000) + 'K'
                        : avg ? '$' + avg : '—';

        const citySet = new Set(leads.map(l => l.Preferred_City__c).filter(Boolean));

        const typeCount = {};
        leads.forEach(l => { if (l.Buyer_Type__c) typeCount[l.Buyer_Type__c] = (typeCount[l.Buyer_Type__c] || 0) + 1; });
        const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];

        const cityCount = {};
        leads.forEach(l => { if (l.Preferred_City__c) cityCount[l.Preferred_City__c] = (cityCount[l.Preferred_City__c] || 0) + 1; });
        const topCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            newCount,
            avgBudget,
            cities:  citySet.size,
            topType: topType ? topType[0] : '—',
            topCity: topCity ? topCity[0].split(',')[0] : ''
        };
    }

    // ─── Filter options ───────────────────────────────────────────────────────
    get filterOptions() {
        const opts = [
            { val: 'all',                    label: 'All'       },
            { val: 'Open - Not Contacted',   label: 'New'       },
            { val: 'Working',                label: 'Working'   },
            { val: 'Closed - Converted',     label: 'Converted' }
        ];
        return opts.map(o => ({
            ...o,
            cls: 'filter-chip' + (this.activeFilter === o.val ? ' active' : '')
        }));
    }

    // ─── Sort label ───────────────────────────────────────────────────────────
    get sortLabel() { return this.sortNewest ? 'Sort: Newest ↓' : 'Sort: Oldest ↑'; }

    // ─── Handlers ────────────────────────────────────────────────────────────
    handleSearch(evt) { this.searchTerm = evt.target.value; }

    handleFilter(evt) {
        this.activeFilter = evt.currentTarget.dataset.val;
    }

    toggleSort() { this.sortNewest = !this.sortNewest; }

    handleSelectLead(evt) {
        this.selectedLeadId = evt.currentTarget.dataset.id;
    }

    closeDetail() { this.selectedLeadId = null; }

    async refreshLeads() {
        this.isLoading = true;
        await refreshApex(this._wiredResult);
        this._leads = (this._wiredResult.data || []).map(l => this._enrichLead(l));
        this.isLoading = false;
        this.showToast('Success', 'Leads refreshed', 'success');
    }

    copyEmail() {
        const lead = this.selectedLead;
        if (!lead?.Email) return;
        navigator.clipboard.writeText(lead.Email).then(() => {
            this.showToast('Copied', lead.Email + ' copied to clipboard', 'success');
        });
    }

    async markContacted() {
        const lead = this.selectedLead;
        if (!lead) return;
        try {
            await updateLeadStatus({ leadId: lead.Id, status: 'Working' });
            await refreshApex(this._wiredResult);
            this._leads = (this._wiredResult.data || []).map(l => this._enrichLead(l));
            this.showToast('Updated', lead.FirstName + ' ' + lead.LastName + ' marked as Working', 'success');
        } catch (err) {
            this.showToast('Error', err.body?.message || 'Update failed', 'error');
        }
    }

    exportCSV() {
        const leads = this._leads;
        if (!leads.length) return;
        const cols = ['Id','FirstName','LastName','Email','Phone','Status',
            'Buyer_Type__c','Property_Types__c','Purchase_Intent__c','Budget__c',
            'Preferred_City__c','Neighbourhood__c','Move_Timeline__c','CreatedDate'];
        const rows = [
            cols.join(','),
            ...leads.map(l => cols.map(c => '"' + (l[c] || '').toString().replace(/"/g, '""') + '"').join(','))
        ];
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'estateiq_leads.csv'; a.click();
        URL.revokeObjectURL(url);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
