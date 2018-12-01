const aws = require('./aws.js');

module.exports = {
  DIC: [
    {
      name: 'user_id',
      type: 'number',
      required: true,
      errorMessage: 'is not between 0 & 99',
      validator: (val) => {
        return (0 <= val && val < 100)
      }
    },
    {
      name: 'date',
      type: 'string',
      required: true
    },
    {
      name: 'comment',
      type: 'string',
      afterValidate: (val) => {
        return val.trim();
      }
    },
    {
      name: 'tag',
      type: 'string',
      afterValidate: (val) => {
        return val.trim();
      }
    },
    {
      name: 'ranking',
      type: 'number',
      errorMessage: 'is not between 0 & 5',
      validator: (val) => {
        return (0 < val && val <=5)
      }
    },
    {
      name: 'gpx',
      type: 'string',
      required: true, 
      errorMessage: 'is not a valid gpx file',
      validator: (val) => {
        return aws.validateGPX(val);
      }
    }
  ],
  safeTrim: function(val) {
    return (typeof val === 'string') ? val.trim() : val;
  },
  validate:  function(pathObj) {
    if (!pathObj) {
      throw `Submitted content is not a valid object!`
    }
    
    // throw an error if valid or resolve
    const willValidateAll = this.DIC.map(async ({name, type, required, validator, afterValidate, errorMessage}) => {
      if (required && (pathObj[name] === undefined || this.safeTrim(pathObj[name]) === '')) {
        throw `${name} is a required field`;
      } else if (pathObj[name] !== undefined) {
        if (typeof pathObj[name] !== type) {
          throw `${name} must be a ${type}`;
        } else if (validator) {
          try {
            const isValid = await validator(pathObj[name]);
            if (!isValid) {
              throw `${name} ${errorMessage}` 
            } else {
              return (afterValidate) ? afterValidate(pathObj[name]) : pathObj[name];
            }
          } catch (e) {
            throw `Error! ${e}`;
          }
        } else {
          return (this.safeTrim(pathObj[name]) === '')  ? null : this.safeTrim(pathObj[name]);
        }
      }
    });
    
    return Promise.all(willValidateAll).then((dataArr) => {
      const formattedObject = {};
      this.DIC.forEach((obj, index) => {
        const key = obj.name;
        if (dataArr[index] !== null) {
          formattedObject[key] = dataArr[index];
        }
      });
      return formattedObject;
    });
  }
}