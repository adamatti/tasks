const _ = require('lodash');
const logger = require('../log')('render');
let models;

function renderCombo(fieldName, entity, dependencies, value) {
  logger.trace('started to render combo ' );
  let result = '<select name=\'row[' + fieldName + ']\'><option value=\'\'></option>';

  const model = _.find(models, (it) => {
    return it.name == entity;
  });
  let rows = dependencies[model.endpoint];
  rows = _.sortBy(rows, (row) => {
    return model.toString(row, dependencies);
  });
  _.each(rows, (row) => {
    result+='<option value=\'' + row.id + '\' ';
    if (value == row.id) {
      result+='selected';
    }
    result+= '>' + model.toString(row, dependencies) + '</option>';
  });

  result+= '</select>';
  return result;
}

module.exports = {
  setModels: function(models_) {
    models = models_;
  },

  renderView: function(dependencies) {
    return function(value, type) {
      if ( _.isNil(value) || value=='') {
        return '';
      } else if ( _.get(type, 'meta.ref') ) {
        const entity = _.get(type, 'meta.ref');
        logger.trace('renderView [entity: %s]', entity);
        const model = _.find(models, (it) => {
          return it.name == entity;
        });
        // logger.trace("renderView: model",model)
        const obj = _.find(dependencies[model.endpoint], (it) => {
          return it.id == value;
        });
        return '<a href=\'/crud/' + model.endpoint + '/' + value + '\'>' + model.toString(obj, dependencies ) + '</a>';
      } else if (type == 'date') {
        // FIXME format date
        // return moment(value,'MMM/dd/YY')
      }
      return value;
    };
  },

  renderEdit: function(model, dependencies) {
    return function(row, fieldName) {
      const field = model.fields[fieldName];
      const value = (row.id ? row[fieldName] : field.meta.defaultValue ) || '';
      const ref = field.meta.ref;
      if (ref) {
        return renderCombo(fieldName, ref, dependencies, value);
      }
      return '<input type="text" value="' + value + '" name="row[' + fieldName + ']">';
    };
  },
};
