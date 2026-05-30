import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import FIRSTNAME_FIELD      from '@salesforce/schema/Lead.FirstName';
import LASTNAME_FIELD       from '@salesforce/schema/Lead.LastName';
import STATUS_FIELD         from '@salesforce/schema/Lead.Status';
import BUYER_TYPE_FIELD     from '@salesforce/schema/Lead.Buyer_Type__c';
import PROPERTY_TYPES_FIELD from '@salesforce/schema/Lead.Property_Types__c';
import INTENT_FIELD         from '@salesforce/schema/Lead.Purchase_Intent__c';
import BUDGET_FIELD         from '@salesforce/schema/Lead.Budget__c';
import BEDROOMS_FIELD       from '@salesforce/schema/Lead.Bedrooms__c';
import BATHROOMS_FIELD      from '@salesforce/schema/Lead.Bathrooms__c';
import GARAGE_FIELD         from '@salesforce/schema/Lead.Garage_Spaces__c';
import FLOORS_FIELD         from '@salesforce/schema/Lead.Floors__c';
import MIN_AREA_FIELD       from '@salesforce/schema/Lead.Min_Area_sqft__c';
import MAX_AREA_FIELD       from '@salesforce/schema/Lead.Max_Area_sqft__c';
import CITY_FIELD           from '@salesforce/schema/Lead.Preferred_City__c';
import NEIGHBOURHOOD_FIELD  from '@salesforce/schema/Lead.Neighbourhood__c';
import PROXIMITY_FIELD      from '@salesforce/schema/Lead.Proximity_Preference__c';
import TIMELINE_FIELD       from '@salesforce/schema/Lead.Move_Timeline__c';
import CONTACT_METHOD_FIELD from '@salesforce/schema/Lead.Preferred_Contact_Method__c';
import INTERIOR_FIELD       from '@salesforce/schema/Lead.Interior_Features__c';
import OUTDOOR_FIELD        from '@salesforce/schema/Lead.Outdoor_Features__c';
import LIFESTYLE_FIELD      from '@salesforce/schema/Lead.Lifestyle_Preferences__c';
import DESCRIPTION_FIELD    from '@salesforce/schema/Lead.Description';

const FIELDS = [
    FIRSTNAME_FIELD, LASTNAME_FIELD, STATUS_FIELD,
    BUYER_TYPE_FIELD, PROPERTY_TYPES_FIELD, INTENT_FIELD,
    BUDGET_FIELD, BEDROOMS_FIELD, BATHROOMS_FIELD, GARAGE_FIELD, FLOORS_FIELD,
    MIN_AREA_FIELD, MAX_AREA_FIELD, CITY_FIELD, NEIGHBOURHOOD_FIELD,
    PROXIMITY_FIELD, TIMELINE_FIELD, CONTACT_METHOD_FIELD,
    INTERIOR_FIELD, OUTDOOR_FIELD, LIFESTYLE_FIELD, DESCRIPTION_FIELD
];

export default class EstateIQLeadSummary extends LightningElement {

    @api recordId;
    _data = {};

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredLead({ data }) {
        if (data) {
            this._data = {
                firstName:     getFieldValue(data, FIRSTNAME_FIELD)      || '',
                lastName:      getFieldValue(data, LASTNAME_FIELD)       || '',
                status:        getFieldValue(data, STATUS_FIELD)         || '',
                buyerType:     getFieldValue(data, BUYER_TYPE_FIELD)     || '—',
                propTypes:     getFieldValue(data, PROPERTY_TYPES_FIELD) || '—',
                intent:        getFieldValue(data, INTENT_FIELD)         || 'Buy',
                budget:        getFieldValue(data, BUDGET_FIELD)         || 0,
                beds:          getFieldValue(data, BEDROOMS_FIELD)       || '—',
                baths:         getFieldValue(data, BATHROOMS_FIELD)      || '—',
                garage:        getFieldValue(data, GARAGE_FIELD)         || '—',
                floors:        getFieldValue(data, FLOORS_FIELD)         || '—',
                minArea:       getFieldValue(data, MIN_AREA_FIELD)       || '',
                maxArea:       getFieldValue(data, MAX_AREA_FIELD)       || '',
                city:          getFieldValue(data, CITY_FIELD)           || '—',
                neighbourhood: getFieldValue(data, NEIGHBOURHOOD_FIELD)  || '',
                proximity:     getFieldValue(data, PROXIMITY_FIELD)      || '',
                timeline:      getFieldValue(data, TIMELINE_FIELD)       || '—',
                contactMethod: getFieldValue(data, CONTACT_METHOD_FIELD) || '—',
                interior:      getFieldValue(data, INTERIOR_FIELD)       || '',
                outdoor:       getFieldValue(data, OUTDOOR_FIELD)        || '',
                lifestyle:     getFieldValue(data, LIFESTYLE_FIELD)      || '',
                notes:         getFieldValue(data, DESCRIPTION_FIELD)    || ''
            };
        }
    }

    get leadName()    { return `${this._data.firstName} ${this._data.lastName}`.trim() || '—'; }
    get initials()    { return ((this._data.firstName||'')[0]||'') + ((this._data.lastName||'')[0]||''); }
    get buyerType()   { return this._data.buyerType; }
    get intent()      { return this._data.intent; }
    get propTypes()   { return this._data.propTypes; }
    get beds()        { return this._data.beds; }
    get baths()       { return this._data.baths; }
    get garage()      { return this._data.garage; }
    get floors()      { return this._data.floors; }
    get city()        { return this._data.city; }
    get neighbourhood(){ return this._data.neighbourhood; }
    get proximity()   { return this._data.proximity; }
    get timeline()    { return this._data.timeline; }
    get contactMethod(){ return this._data.contactMethod; }
    get notes()       { return this._data.notes; }
    get budget()      { return this._data.budget; }

    get budgetFormatted() {
        const v = this._data.budget;
        if (!v) return '—';
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000)    return '$' + Math.round(v / 1000) + 'K';
        return '$' + v.toLocaleString();
    }

    get hasArea() { return this._data.minArea || this._data.maxArea; }
    get areaStr() { return `${this._data.minArea || '?'} – ${this._data.maxArea || '?'}`; }

    get statusCls() {
        const s = this._data.status || '';
        if (s === 'Open - Not Contacted') return 'status-badge s-new';
        if (s === 'Working')              return 'status-badge s-working';
        if (s.includes('Converted'))      return 'status-badge s-converted';
        return 'status-badge s-closed';
    }

    get statusLabel() {
        const s = this._data.status || '';
        if (s === 'Open - Not Contacted') return 'New';
        if (s === 'Working')              return 'Working';
        if (s.includes('Converted'))      return 'Converted';
        return s || 'Unknown';
    }

    get hasFeatures() {
        return this._data.interior || this._data.outdoor || this._data.lifestyle;
    }

    get allFeaturePills() {
        const interior  = (this._data.interior  || '').split(';').map(s => s.trim()).filter(Boolean);
        const outdoor   = (this._data.outdoor   || '').split(';').map(s => s.trim()).filter(Boolean);
        const lifestyle = (this._data.lifestyle || '').split(';').map(s => s.trim()).filter(Boolean);
        return [
            ...interior.map(v  => ({ val: v, cls: 'pill pill-green'  })),
            ...outdoor.map(v   => ({ val: v, cls: 'pill pill-blue'   })),
            ...lifestyle.map(v => ({ val: v, cls: 'pill pill-orange' }))
        ];
    }
}
