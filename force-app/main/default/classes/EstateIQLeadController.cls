public with sharing class EstateIQLeadController {

    @AuraEnabled
    public static String createLead(Map<String, Object> leadData) {
        try {
            Lead newLead = new Lead();

            newLead.FirstName               = (String) leadData.get('firstName');
            newLead.LastName                = (String) leadData.get('lastName');
            newLead.Email                   = (String) leadData.get('email');
            newLead.Phone                   = (String) leadData.get('phone');
            newLead.Company                 = 'EstateIQ Enquiry';
            newLead.LeadSource              = 'Web';
            newLead.Status                  = 'Open - Not Contacted';

            // Custom Fields — create these on the Lead object in your org
            if (leadData.get('contact') != null)
                newLead.Preferred_Contact_Method__c = (String) leadData.get('contact');

            if (leadData.get('buyerType') != null)
                newLead.Buyer_Type__c = (String) leadData.get('buyerType');

            if (leadData.get('propTypes') != null)
                newLead.Property_Types__c = (String) leadData.get('propTypes');

            if (leadData.get('intent') != null)
                newLead.Purchase_Intent__c = (String) leadData.get('intent');

            if (leadData.get('budget') != null)
                newLead.Budget__c = Decimal.valueOf(String.valueOf(leadData.get('budget')));

            if (leadData.get('beds') != null)
                newLead.Bedrooms__c = Integer.valueOf(String.valueOf(leadData.get('beds')));

            if (leadData.get('baths') != null)
                newLead.Bathrooms__c = Integer.valueOf(String.valueOf(leadData.get('baths')));

            if (leadData.get('garage') != null)
                newLead.Garage_Spaces__c = Integer.valueOf(String.valueOf(leadData.get('garage')));

            if (leadData.get('floors') != null)
                newLead.Floors__c = Integer.valueOf(String.valueOf(leadData.get('floors')));

            if (leadData.get('areaMin') != null && leadData.get('areaMin') != '')
                newLead.Min_Area_sqft__c = Decimal.valueOf(String.valueOf(leadData.get('areaMin')));

            if (leadData.get('areaMax') != null && leadData.get('areaMax') != '')
                newLead.Max_Area_sqft__c = Decimal.valueOf(String.valueOf(leadData.get('areaMax')));

            if (leadData.get('city') != null)
                newLead.Preferred_City__c = (String) leadData.get('city');

            if (leadData.get('neighbourhood') != null)
                newLead.Neighbourhood__c = (String) leadData.get('neighbourhood');

            if (leadData.get('proximity') != null)
                newLead.Proximity_Preference__c = (String) leadData.get('proximity');

            if (leadData.get('timeline') != null)
                newLead.Move_Timeline__c = (String) leadData.get('timeline');

            if (leadData.get('interior') != null)
                newLead.Interior_Features__c = (String) leadData.get('interior');

            if (leadData.get('outdoor') != null)
                newLead.Outdoor_Features__c = (String) leadData.get('outdoor');

            if (leadData.get('lifestyle') != null)
                newLead.Lifestyle_Preferences__c = (String) leadData.get('lifestyle');

            if (leadData.get('notes') != null)
                newLead.Description = (String) leadData.get('notes');

            insert newLead;
            return newLead.Id;

        } catch (Exception e) {
            throw new AuraHandledException('Failed to create lead: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Lead> getLeads() {
        return [
            SELECT Id, FirstName, LastName, Email, Phone, Status, LeadSource, CreatedDate,
                   Preferred_Contact_Method__c, Buyer_Type__c, Property_Types__c,
                   Purchase_Intent__c, Budget__c, Bedrooms__c, Bathrooms__c,
                   Garage_Spaces__c, Floors__c, Min_Area_sqft__c, Max_Area_sqft__c,
                   Preferred_City__c, Neighbourhood__c, Proximity_Preference__c,
                   Move_Timeline__c, Interior_Features__c, Outdoor_Features__c,
                   Lifestyle_Preferences__c, Description
            FROM Lead
            WHERE LeadSource = 'Web'
            ORDER BY CreatedDate DESC
            LIMIT 200
        ];
    }

    @AuraEnabled
    public static void updateLeadStatus(String leadId, String status) {
        try {
            Lead l = new Lead(Id = leadId, Status = status);
            update l;
        } catch (Exception e) {
            throw new AuraHandledException('Failed to update lead: ' + e.getMessage());
        }
    }
}
