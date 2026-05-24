import { LightningElement, track,api } from 'lwc';
import createLead from '@salesforce/apex/EstateIQLeadController.createLead';

export default class EstateIQIntake extends LightningElement {

    // ─── State ───────────────────────────────────────────────────────────────
    @track currentStep = 1;
    @track showSuccess = false;
    @track isSubmitting = false;
    @track errorMessage = '';
    @track createdLeadId = '';

    @api title = 'EstateIQ Intake Form'; 

    @track state = {
        firstName: '', lastName: '', email: '', phone: '', contact: '',
        buyerType: '',
        propTypes: [], intent: 'Buy', propNotes: '',
        budget: 1500000, beds: 3, baths: 2, garage: 1, floors: 2,
        areaMin: '', areaMax: '',
        city: '', neighbourhood: '', proximity: '', timeline: '',
        interior: [], outdoor: [], lifestyle: [], extraNotes: ''
    };

    // Validation error flags
    @track errors = { firstName: false, lastName: false, email: false, phone: false, city: false };

    // ─── Static Data ─────────────────────────────────────────────────────────
    _buyerTypes = [
        { val: 'First-Time Buyer', icon: '🏠' },
        { val: 'Investor',         icon: '📈' },
        { val: 'Relocating',       icon: '✈️' },
        { val: 'Upsizing',         icon: '⬆️' },
        { val: 'Downsizing',       icon: '⬇️' },
        { val: 'Holiday Home',     icon: '🏖️' }
    ];

    _propTypes = [
        { val: 'House',       icon: '🏡' },
        { val: 'Apartment',   icon: '🏢' },
        { val: 'Villa',       icon: '🏰' },
        { val: 'Townhouse',   icon: '🏘️' },
        { val: 'Land',        icon: '🌿' },
        { val: 'Penthouse',   icon: '🌆' },
        { val: 'Studio',      icon: '🛏️' },
        { val: 'Farm/Estate', icon: '🌾' }
    ];

    _timeline = [
        { val: 'ASAP',        icon: '⚡', sub: 'Within 1 month'  },
        { val: '1–3 months',  icon: '📅', sub: 'Short term'      },
        { val: '3–6 months',  icon: '🗓️', sub: 'Mid term'        },
        { val: '6–12 months', icon: '🔭', sub: 'Planning ahead'  }
    ];

    _interior  = ['Open Plan Kitchen','Home Office','Walk-in Closet','Smart Home',
                  'Fireplace','High Ceilings','Basement','Gym Room','Home Theatre','Wine Cellar'];
    _outdoor   = ['Pool','Large Garden','Rooftop Terrace','Sea View',
                  'Mountain View','BBQ Area','Gated Community','Tennis Court'];
    _lifestyle = ['Pet Friendly','Near Schools','Quiet Neighbourhood','City Life',
                  'Beach Access','Golf Course Nearby','EV Charging','Solar Panels'];

    _counterConfig = {
        beds:   { min: 1, max: 10 },
        baths:  { min: 1, max: 8  },
        garage: { min: 0, max: 6  },
        floors: { min: 1, max: 10 }
    };

    // ─── Step visibility ─────────────────────────────────────────────────────
    get isStep1() { return this.currentStep === 1 && !this.showSuccess; }
    get isStep2() { return this.currentStep === 2 && !this.showSuccess; }
    get isStep3() { return this.currentStep === 3 && !this.showSuccess; }
    get isStep4() { return this.currentStep === 4 && !this.showSuccess; }
    get isStep5() { return this.currentStep === 5 && !this.showSuccess; }

    // ─── Progress bar ────────────────────────────────────────────────────────
    get progressStyle() {
        return `width:${(this.currentStep / 5) * 100}%`;
    }

    // ─── Sidebar steps list ──────────────────────────────────────────────────
    get stepsList() {
        const defs = [
            { num: 1, label: 'Your Details',        desc: 'Name, contact & role'   },
            { num: 2, label: 'Property Type',        desc: 'What kind of home'       },
            { num: 3, label: 'Budget & Size',        desc: 'Budget, beds & baths'   },
            { num: 4, label: 'Location & Timeline',  desc: 'Where & when'            },
            { num: 5, label: 'Preferences',          desc: 'Features & extras'       }
        ];
        return defs.map(s => ({
            ...s,
            done: s.num < this.currentStep,
            cls: [
                'step-item',
                s.num === this.currentStep ? 'active' : '',
                s.num < this.currentStep   ? 'done'   : ''
            ].join(' ').trim()
        }));
    }

    // ─── Tile getters ────────────────────────────────────────────────────────
    get buyerTypes() {
        return this._buyerTypes.map(t => ({
            ...t,
            cls: 'tile' + (this.state.buyerType === t.val ? ' selected' : '')
        }));
    }

    get propTypesList() {
        return this._propTypes.map(t => ({
            ...t,
            cls: 'tile' + (this.state.propTypes.includes(t.val) ? ' selected' : '')
        }));
    }

    get timelineList() {
        return this._timeline.map(t => ({
            ...t,
            cls: 'timeline-card' + (this.state.timeline === t.val ? ' selected' : '')
        }));
    }

    // ─── Pill getters ────────────────────────────────────────────────────────
    get interiorList() {
        return this._interior.map(v => ({
            val: v,
            cls: 'pill' + (this.state.interior.includes(v) ? ' selected' : '')
        }));
    }

    get outdoorList() {
        return this._outdoor.map(v => ({
            val: v,
            cls: 'pill' + (this.state.outdoor.includes(v) ? ' selected' : '')
        }));
    }

    get lifestyleList() {
        return this._lifestyle.map(v => ({
            val: v,
            cls: 'pill' + (this.state.lifestyle.includes(v) ? ' selected' : '')
        }));
    }

    // ─── Intent toggle ───────────────────────────────────────────────────────
    get intentBuyCls()  { return 'toggle-btn' + (this.state.intent === 'Buy'  ? ' active' : ''); }
    get intentRentCls() { return 'toggle-btn' + (this.state.intent === 'Rent' ? ' active' : ''); }

    // ─── Budget formatting ───────────────────────────────────────────────────
    get formattedBudget() {
        const v = this.state.budget;
        if (v >= 10000000) return '$10M+';
        if (v >= 1000000)  return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000)     return '$' + Math.round(v / 1000) + 'K';
        return '$' + v.toLocaleString();
    }

    // ─── Submit button ───────────────────────────────────────────────────────
    get submitBtnCls() {
        return 'btn-next submit-btn' + (this.isSubmitting ? ' loading' : '');
    }

    // ─── Field error classes ─────────────────────────────────────────────────
    get firstNameCls() { return 'field-input' + (this.errors.firstName ? ' error' : ''); }
    get lastNameCls()  { return 'field-input' + (this.errors.lastName  ? ' error' : ''); }
    get emailCls()     { return 'field-input' + (this.errors.email     ? ' error' : ''); }
    get phoneCls()     { return 'field-input' + (this.errors.phone     ? ' error' : ''); }
    get cityCls()      { return 'field-input' + (this.errors.city      ? ' error' : ''); }

    // ─── Handlers ────────────────────────────────────────────────────────────
    handleInput(evt) {
        const field = evt.target.dataset.field;
        this.state = { ...this.state, [field]: evt.target.value };
        if (this.errors[field]) {
            this.errors = { ...this.errors, [field]: false };
        }
    }

    handleBudget(evt) {
        this.state = { ...this.state, budget: parseInt(evt.target.value, 10) };
    }

    handleCounter(evt) {
        const field = evt.currentTarget.dataset.field;
        const dir   = parseInt(evt.currentTarget.dataset.dir, 10);
        const cfg   = this._counterConfig[field];
        const newVal = Math.min(cfg.max, Math.max(cfg.min, this.state[field] + dir));
        this.state = { ...this.state, [field]: newVal };
    }

    handleTile(evt) {
        const group = evt.currentTarget.dataset.group;
        const val   = evt.currentTarget.dataset.val;
        this.state  = { ...this.state, [group]: val };
    }

    handleTileMulti(evt) {
        const group = evt.currentTarget.dataset.group;
        const val   = evt.currentTarget.dataset.val;
        const arr   = [...this.state[group]];
        const idx   = arr.indexOf(val);
        if (idx > -1) arr.splice(idx, 1);
        else arr.push(val);
        this.state = { ...this.state, [group]: arr };
    }

    handlePill(evt) {
        const group = evt.currentTarget.dataset.group;
        const val   = evt.currentTarget.dataset.val;
        const arr   = [...this.state[group]];
        const idx   = arr.indexOf(val);
        if (idx > -1) arr.splice(idx, 1);
        else arr.push(val);
        this.state = { ...this.state, [group]: arr };
    }

    handleIntent(evt) {
        this.state = { ...this.state, intent: evt.currentTarget.dataset.val };
    }

    handleStepClick(evt) {
        const step = parseInt(evt.currentTarget.dataset.step, 10);
        if (step < this.currentStep) {
            this.currentStep = step;
        }
    }

    // ─── Navigation ──────────────────────────────────────────────────────────
    nextStep() {
        if (!this.validateCurrentStep()) return;
        this.currentStep = Math.min(5, this.currentStep + 1);
        this.scrollToTop();
    }

    prevStep() {
        this.currentStep = Math.max(1, this.currentStep - 1);
        this.scrollToTop();
    }

    scrollToTop() {
        const el = this.template.querySelector('.main');
        if (el) el.scrollTop = 0;
    }

    // ─── Validation ──────────────────────────────────────────────────────────
    validateCurrentStep() {
        const s = this.state;
        let valid = true;
        const newErrors = { ...this.errors };

        if (this.currentStep === 1) {
            if (!s.firstName.trim()) { newErrors.firstName = true; valid = false; }
            if (!s.lastName.trim())  { newErrors.lastName  = true; valid = false; }
            if (!s.email.trim() || !s.email.includes('@')) { newErrors.email = true; valid = false; }
            if (!s.phone.trim())     { newErrors.phone     = true; valid = false; }
        }
        if (this.currentStep === 4) {
            if (!s.city.trim()) { newErrors.city = true; valid = false; }
        }

        this.errors = newErrors;
        return valid;
    }

    // ─── Submit ───────────────────────────────────────────────────────────────
    async submitForm() {
        if (!this.validateCurrentStep()) return;

        this.isSubmitting  = true;
        this.errorMessage  = '';

        const leadData = {
            firstName:    this.state.firstName,
            lastName:     this.state.lastName,
            email:        this.state.email,
            phone:        this.state.phone,
            contact:      this.state.contact,
            buyerType:    this.state.buyerType,
            propTypes:    this.state.propTypes.join('; '),
            intent:       this.state.intent,
            budget:       this.state.budget,
            beds:         this.state.beds,
            baths:        this.state.baths,
            garage:       this.state.garage,
            floors:       this.state.floors,
            areaMin:      this.state.areaMin,
            areaMax:      this.state.areaMax,
            city:         this.state.city,
            neighbourhood:this.state.neighbourhood,
            proximity:    this.state.proximity,
            timeline:     this.state.timeline,
            interior:     this.state.interior.join('; '),
            outdoor:      this.state.outdoor.join('; '),
            lifestyle:    this.state.lifestyle.join('; '),
            notes:        [this.state.propNotes, this.state.extraNotes].filter(Boolean).join('\n\n')
        };

        try {
            const leadId = await createLead({ leadData });
            this.createdLeadId = leadId;
            this.showSuccess   = true;
        } catch (err) {
            this.errorMessage = err.body?.message || 'Something went wrong. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    // ─── Reset ───────────────────────────────────────────────────────────────
    resetForm() {
        this.currentStep  = 1;
        this.showSuccess  = false;
        this.errorMessage = '';
        this.createdLeadId = '';
        this.state = {
            firstName: '', lastName: '', email: '', phone: '', contact: '',
            buyerType: '', propTypes: [], intent: 'Buy', propNotes: '',
            budget: 1500000, beds: 3, baths: 2, garage: 1, floors: 2,
            areaMin: '', areaMax: '',
            city: '', neighbourhood: '', proximity: '', timeline: '',
            interior: [], outdoor: [], lifestyle: [], extraNotes: ''
        };
        this.errors = { firstName: false, lastName: false, email: false, phone: false, city: false };
    }
}
