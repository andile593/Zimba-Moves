
function validate(schema) {
  return (req, res, next) => {
    if (!schema) {
      console.error('Schema is undefined!');
      return res.status(500).json({ error: 'Validation schema not configured' });
    }
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: "Validation failed", details: error.details });
    }
    next();
  };
}

// backend/middleware/validate.js
module.exports = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Show all errors
      stripUnknown: true // Remove fields not in schema
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      console.error('Validation error:', details);
      
      return res.status(400).json({
        error: 'Validation failed',
        details: details
      });
    }

   
    req.body = value;
    next();
  };
};

module.exports = validate;