import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import FIRSTNAME_FIELD     from '@salesforce/schema/Lead.FirstName';
import LASTNAME_FIELD      from '@salesforce/schema/Lead.LastName';
import COMPANY_FIELD       from '@salesforce/schema/Lead.Company';
import PHONE_FIELD         from '@salesforce/schema/Lead.Phone';
import EMAIL_FIELD         from '@salesforce/schema/Lead.Email';
import STATUS_FIELD        from '@salesforce/schema/Lead.Status';
import CITY_FIELD          from '@salesforce/schema/Lead.Preferred_City__c';
import NEIGHBOURHOOD_FIELD from '@salesforce/schema/Lead.Neighbourhood__c';
import BUDGET_FIELD        from '@salesforce/schema/Lead.Budget__c';
import TIMELINE_FIELD      from '@salesforce/schema/Lead.Move_Timeline__c';
import BEDS_FIELD          from '@salesforce/schema/Lead.Bedrooms__c';
import BATHS_FIELD         from '@salesforce/schema/Lead.Bathrooms__c';
import PROPTYPES_FIELD     from '@salesforce/schema/Lead.Property_Types__c';
import INTENT_FIELD        from '@salesforce/schema/Lead.Purchase_Intent__c';
import CONTACT_FIELD       from '@salesforce/schema/Lead.Preferred_Contact_Method__c';

const FIELDS = [
    FIRSTNAME_FIELD, LASTNAME_FIELD, COMPANY_FIELD, PHONE_FIELD, EMAIL_FIELD,
    STATUS_FIELD, CITY_FIELD, NEIGHBOURHOOD_FIELD, BUDGET_FIELD, TIMELINE_FIELD,
    BEDS_FIELD, BATHS_FIELD, PROPTYPES_FIELD, INTENT_FIELD, CONTACT_FIELD
];

const STATUS_ORDER = [
    { id: 'open',      stepLabel: 'Open',                   icon: 'utility:check',  keys: ['Open - Not Contacted'] },
    { id: 'working',   stepLabel: 'Working — Contacted',    icon: 'utility:user',   keys: ['Working', 'Working - Contacted'] },
    { id: 'closed',    stepLabel: 'Closed — Not Converted', icon: 'utility:close',  keys: ['Closed - Not Converted'] },
    { id: 'converted', stepLabel: 'Converted',              icon: 'utility:ribbon', keys: ['Converted'] }
];

export default class EstateIQLeadHeader extends NavigationMixin(LightningElement) {

    @api recordId;
    @track _data = {};

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredLead({ data, error }) {
        if (data) {
            this._data = {
                firstName:     getFieldValue(data, FIRSTNAME_FIELD)     ?? '',
                lastName:      getFieldValue(data, LASTNAME_FIELD)      ?? '',
                company:       getFieldValue(data, COMPANY_FIELD)       ?? '',
                phone:         getFieldValue(data, PHONE_FIELD)         ?? '',
                email:         getFieldValue(data, EMAIL_FIELD)         ?? '',
                status:        getFieldValue(data, STATUS_FIELD)        ?? '',
                city:          getFieldValue(data, CITY_FIELD)          ?? '',
                neighbourhood: getFieldValue(data, NEIGHBOURHOOD_FIELD) ?? '',
                budget:        getFieldValue(data, BUDGET_FIELD)        ?? 0,
                timeline:      getFieldValue(data, TIMELINE_FIELD)      ?? '',
                beds:          getFieldValue(data, BEDS_FIELD)          ?? 0,
                baths:         getFieldValue(data, BATHS_FIELD)         ?? 0,
                propTypes:     getFieldValue(data, PROPTYPES_FIELD)     ?? '',
                intent:        getFieldValue(data, INTENT_FIELD)        ?? '',
                contactMethod: getFieldValue(data, CONTACT_FIELD)       ?? ''
            };
        } else if (error) {
            console.error('EstateIQLeadHeader wire error:', JSON.stringify(error));
        }
    }

    // ── Identity ─────────────────────────────────────────────────────────────

    get fullName() {
        return `${this._data.firstName} ${this._data.lastName}`.trim() || 'Unknown Lead';
    }

    get initials() {
        const f = this._data.firstName?.[0] ?? '';
        const l = this._data.lastName?.[0]  ?? '';
        return (f + l).toUpperCase() || '?';
    }

    get company()  { return this._data.company; }
    get phone()    { return this._data.phone; }
    get email()    { return this._data.email; }
    get city()     { return this._data.city; }
    get timeline() { return this._data.timeline; }

    get phoneHref() { return `tel:${this._data.phone}`; }
    get emailHref() { return `mailto:${this._data.email}`; }

    get locationDisplay() {
        const { neighbourhood, city } = this._data;
        return neighbourhood ? `${neighbourhood}, ${city}` : city;
    }

    get budgetFormatted() {
        const b = this._data.budget;
        if (!b) return '';
        return b >= 1000000
            ? '$' + (b / 1000000).toFixed(1) + 'M'
            : '$' + Math.round(b / 1000) + 'K';
    }

    // ── Status steps ──────────────────────────────────────────────────────────

    get statusSteps() {
        const current    = this._data.status;
        const currentIdx = STATUS_ORDER.findIndex(s => s.keys.includes(current));

        return STATUS_ORDER.map((s, i) => {
            const isDone   = i < currentIdx;
            const isActive = i === currentIdx;
            const isLast   = i === STATUS_ORDER.length - 1;

            return {
                id:           s.id,
                stepLabel:    s.stepLabel,
                stepIcon:     s.icon,
                isLast,
                wrapperClass: 'step-item',
                dotClass:     isDone ? 'step-dot done' : isActive ? 'step-dot active' : 'step-dot',
                labelClass:   isDone ? 'step-label done' : isActive ? 'step-label active' : 'step-label',
                lineClass:    isDone ? 'step-line done' : 'step-line'
            };
        });
    }

    // ── Lead score ────────────────────────────────────────────────────────────

    get leadScore() {
        const d = this._data;
        let s = 0;
        if (d.firstName && d.lastName) s += 10;
        if (d.company)       s += 5;
        if (d.budget > 0)    s += 20;
        if (d.city)          s += 15;
        if (d.beds > 0)      s += 5;
        if (d.baths > 0)     s += 5;
        if (d.timeline)      s += 10;
        if (d.propTypes)     s += 10;
        if (d.intent)        s += 10;
        if (d.contactMethod) s += 5;
        if (d.phone || d.email) s += 5;
        return Math.min(s, 100);
    }

    get scoreLabel() {
        const s = this.leadScore;
        if (s >= 70) return 'High quality';
        if (s >= 40) return 'Medium quality';
        return 'Needs more info';
    }

    get scoreClass() {
        const s = this.leadScore;
        if (s >= 70) return 'score-pill high';
        if (s >= 40) return 'score-pill medium';
        return 'score-pill low';
    }

    // ── Quick tags ────────────────────────────────────────────────────────────

    get quickTags() {
        const d = this._data;
        const tags = [];
        if (d.beds)          tags.push(`${d.beds} Bed`);
        if (d.baths)         tags.push(`${d.baths} Bath`);
        if (d.propTypes)     tags.push(d.propTypes.split(';')[0].trim());
        if (d.intent)        tags.push(d.intent);
        if (d.contactMethod) tags.push(d.contactMethod);
        return tags;
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    handleFollow() {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Following lead', variant: 'success'
        }));
    }

    handleNewCase() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: { objectApiName: 'Case', actionName: 'new' },
            state: { defaultFieldValues: `SuppliedEmail=${this._data.email}` }
        });
    }

    handleNewNote() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: { objectApiName: 'Note', actionName: 'new' }
        });
    }

    handleApproval() {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Submitted for approval', variant: 'info'
        }));
    }

    handleMarkComplete() {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Marked as complete', variant: 'success'
        }));
    }

    handleEditPreferences() {
        this.dispatchEvent(new CustomEvent('editpreferences'));
    }

    handleGeneratePrompt() {
        this.dispatchEvent(new CustomEvent('generateprompt'));
    }
}
