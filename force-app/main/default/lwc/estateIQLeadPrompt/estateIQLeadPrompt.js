import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Standard Lead fields
import FIRSTNAME_FIELD        from '@salesforce/schema/Lead.FirstName';
import LASTNAME_FIELD         from '@salesforce/schema/Lead.LastName';
import STATUS_FIELD           from '@salesforce/schema/Lead.Status';

// Custom fields
import BUYER_TYPE_FIELD       from '@salesforce/schema/Lead.Buyer_Type__c';
import PROPERTY_TYPES_FIELD   from '@salesforce/schema/Lead.Property_Types__c';
import INTENT_FIELD           from '@salesforce/schema/Lead.Purchase_Intent__c';
import BUDGET_FIELD           from '@salesforce/schema/Lead.Budget__c';
import BEDROOMS_FIELD         from '@salesforce/schema/Lead.Bedrooms__c';
import BATHROOMS_FIELD        from '@salesforce/schema/Lead.Bathrooms__c';
import GARAGE_FIELD           from '@salesforce/schema/Lead.Garage_Spaces__c';
import FLOORS_FIELD           from '@salesforce/schema/Lead.Floors__c';
import MIN_AREA_FIELD         from '@salesforce/schema/Lead.Min_Area_sqft__c';
import MAX_AREA_FIELD         from '@salesforce/schema/Lead.Max_Area_sqft__c';
import CITY_FIELD             from '@salesforce/schema/Lead.Preferred_City__c';
import NEIGHBOURHOOD_FIELD    from '@salesforce/schema/Lead.Neighbourhood__c';
import PROXIMITY_FIELD        from '@salesforce/schema/Lead.Proximity_Preference__c';
import TIMELINE_FIELD         from '@salesforce/schema/Lead.Move_Timeline__c';
import CONTACT_METHOD_FIELD   from '@salesforce/schema/Lead.Preferred_Contact_Method__c';
import INTERIOR_FIELD         from '@salesforce/schema/Lead.Interior_Features__c';
import OUTDOOR_FIELD          from '@salesforce/schema/Lead.Outdoor_Features__c';
import LIFESTYLE_FIELD        from '@salesforce/schema/Lead.Lifestyle_Preferences__c';
import DESCRIPTION_FIELD      from '@salesforce/schema/Lead.Description';

const FIELDS = [
    FIRSTNAME_FIELD, LASTNAME_FIELD, STATUS_FIELD,
    BUYER_TYPE_FIELD, PROPERTY_TYPES_FIELD, INTENT_FIELD,
    BUDGET_FIELD, BEDROOMS_FIELD, BATHROOMS_FIELD, GARAGE_FIELD, FLOORS_FIELD,
    MIN_AREA_FIELD, MAX_AREA_FIELD, CITY_FIELD, NEIGHBOURHOOD_FIELD,
    PROXIMITY_FIELD, TIMELINE_FIELD, CONTACT_METHOD_FIELD,
    INTERIOR_FIELD, OUTDOOR_FIELD, LIFESTYLE_FIELD, DESCRIPTION_FIELD
];

export default class EstateIQLeadPrompt extends LightningElement {

    @api recordId;
    @track promptText   = '';
    @track isLoading    = true;
    @track copyLabel    = '📋 Copy Prompt';
    @track leadScore    = 0;
    @track matchTags    = [];

    _leadData = {};

    // ─── Wire lead record ─────────────────────────────────────────────────────
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredLead({ data, error }) {
        if (data) {
            this._leadData = {
                firstName:    getFieldValue(data, FIRSTNAME_FIELD)      || '',
                lastName:     getFieldValue(data, LASTNAME_FIELD)       || '',
                status:       getFieldValue(data, STATUS_FIELD)         || '',
                buyerType:    getFieldValue(data, BUYER_TYPE_FIELD)     || '',
                propTypes:    getFieldValue(data, PROPERTY_TYPES_FIELD) || '',
                intent:       getFieldValue(data, INTENT_FIELD)         || 'Buy',
                budget:       getFieldValue(data, BUDGET_FIELD)         || 0,
                beds:         getFieldValue(data, BEDROOMS_FIELD)       || 0,
                baths:        getFieldValue(data, BATHROOMS_FIELD)      || 0,
                garage:       getFieldValue(data, GARAGE_FIELD)         || 0,
                floors:       getFieldValue(data, FLOORS_FIELD)         || 0,
                minArea:      getFieldValue(data, MIN_AREA_FIELD)       || '',
                maxArea:      getFieldValue(data, MAX_AREA_FIELD)       || '',
                city:         getFieldValue(data, CITY_FIELD)           || '',
                neighbourhood:getFieldValue(data, NEIGHBOURHOOD_FIELD)  || '',
                proximity:    getFieldValue(data, PROXIMITY_FIELD)      || '',
                timeline:     getFieldValue(data, TIMELINE_FIELD)       || '',
                contactMethod:getFieldValue(data, CONTACT_METHOD_FIELD) || '',
                interior:     getFieldValue(data, INTERIOR_FIELD)       || '',
                outdoor:      getFieldValue(data, OUTDOOR_FIELD)        || '',
                lifestyle:    getFieldValue(data, LIFESTYLE_FIELD)      || '',
                notes:        getFieldValue(data, DESCRIPTION_FIELD)    || ''
            };
            this.generatePrompt();
        } else if (error) {
            this.isLoading = false;
        }
    }

    // ─── Generate prompt ──────────────────────────────────────────────────────
    generatePrompt() {
        this.isLoading = true;
        const d = this._leadData;

        if (!d.city && !d.budget && !d.buyerType) {
            this.promptText = '';
            this.isLoading  = false;
            return;
        }

        // Format budget
        const budgetFormatted = d.budget
            ? (d.budget >= 1000000
                ? '$' + (d.budget / 1000000).toFixed(1) + 'M'
                : '$' + Math.round(d.budget / 1000) + 'K')
            : 'not specified';

        // Format area
        const areaStr = (d.minArea || d.maxArea)
            ? `between ${d.minArea || '?'} and ${d.maxArea || '?'} sqft`
            : 'no area preference specified';

        // Format features
        const allFeatures = [d.interior, d.outdoor, d.lifestyle]
            .filter(Boolean).join('; ');

        // Format location
        const locationStr = d.neighbourhood
            ? `${d.neighbourhood}, ${d.city}`
            : d.city || 'location not specified';

        // Build the prompt
        this.promptText =
`You are a luxury real estate agent. A new lead has submitted their property requirements. Here is a full summary:

👤 CLIENT: ${d.firstName} ${d.lastName} — ${d.buyerType || 'Buyer'}
📋 INTENT: Looking to ${d.intent} a ${d.propTypes || 'property'}
💰 BUDGET: ${budgetFormatted}
📍 LOCATION: ${locationStr}${d.proximity ? ` (${d.proximity})` : ''}
🛏️ SIZE: ${d.beds} bed / ${d.baths} bath / ${d.garage} garage / ${d.floors} floor(s) — ${areaStr}
⏰ TIMELINE: ${d.timeline || 'Not specified'}
📞 PREFERRED CONTACT: ${d.contactMethod || 'Not specified'}
✨ FEATURES WANTED: ${allFeatures || 'None specified'}
📝 NOTES: ${d.notes || 'None'}

Based on the above, please:
1. Suggest the TOP 3 best-matched property types and neighbourhoods in ${d.city || 'their preferred city'}
2. Identify any RED FLAGS or concerns about the budget vs expectations
3. Recommend the best approach to contact this client (timing, tone, talking points)
4. List 3 specific questions to ask this client on the first call to qualify further`;

        // Build match tags
        const tags = [];
        if (d.propTypes)  tags.push(...d.propTypes.split(';').map(s => s.trim()).filter(Boolean));
        if (d.city)       tags.push('📍 ' + d.city.split(',')[0]);
        if (d.budget)     tags.push('💰 ' + budgetFormatted);
        if (d.beds)       tags.push('🛏️ ' + d.beds + ' Bed');
        if (d.timeline)   tags.push('⏰ ' + d.timeline);
        if (d.intent)     tags.push(d.intent === 'Buy' ? '🔑 Buy' : '📋 Rent');
        this.matchTags = tags;

        // Calculate lead score
        this.leadScore = this._calcScore(d);

        this.isLoading = false;
    }

    // ─── Lead score ───────────────────────────────────────────────────────────
    _calcScore(d) {
        let score = 0;
        if (d.firstName && d.lastName) score += 10;
        if (d.buyerType)    score += 10;
        if (d.propTypes)    score += 10;
        if (d.budget > 0)   score += 20;
        if (d.city)         score += 15;
        if (d.beds > 0)     score += 5;
        if (d.baths > 0)    score += 5;
        if (d.timeline)     score += 10;
        if (d.interior || d.outdoor || d.lifestyle) score += 10;
        if (d.notes)        score += 5;
        return Math.min(score, 100);
    }

    get scoreBarStyle() {
        const color = this.leadScore >= 70 ? '#22c55e'
                    : this.leadScore >= 40 ? '#f59e0b'
                    : '#ef4444';
        return `width:${this.leadScore}%;background:${color};`;
    }

    get scoreLabel() {
        if (this.leadScore >= 70) return '🟢 High Quality Lead';
        if (this.leadScore >= 40) return '🟡 Medium Quality Lead';
        return '🔴 Low Quality — needs more info';
    }

    get statusCls() {
        const s = this._leadData.status || '';
        if (s === 'Open - Not Contacted') return 'status-badge new';
        if (s === 'Working')              return 'status-badge working';
        if (s.includes('Converted'))      return 'status-badge converted';
        return 'status-badge closed';
    }

    get statusLabel() {
        const s = this._leadData.status || 'New';
        if (s === 'Open - Not Contacted') return 'New';
        return s;
    }

    // ─── Actions ──────────────────────────────────────────────────────────────
    copyPrompt() {
        navigator.clipboard.writeText(this.promptText).then(() => {
            this.copyLabel = '✅ Copied!';
            setTimeout(() => { this.copyLabel = '📋 Copy Prompt'; }, 2000);
        });
    }

    sendToAgentforce() {
        this.dispatchEvent(new ShowToastEvent({
            title:   '⚡ Sent to Agentforce',
            message: 'Prompt has been sent to Agentforce for processing.',
            variant: 'success'
        }));
    }
}
