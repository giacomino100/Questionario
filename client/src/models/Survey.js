
/**
 * Object describing a survey
 */
 class Survey {
    /**
     * Create a new Survey
     * @param {*} id unique code for the survey
     * @param {*} name full name of the survey
     * @param {*} description description of the survey
     * @param {*} viewers viewers of the survey
     */
    constructor(id, name, description, viewers) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.viewers = viewers;
    }
  
    /**
     * Creates a new Survey from plain (JSON) objects
     * @param {*} json a plain object (coming form JSON deserialization)
     * with the right properties
     * @return {Survey} the newly created object
     */
    static from(json) {
      const survey = new Survey();
      delete Object.assign(survey, json, {id: json.id}).id;
      return survey;
    }
  
  }
  
  export default Survey;