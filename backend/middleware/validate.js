const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      console.error('Schema is undefined!');
      return res.status(500).json({ error: 'Validation schema not configured' });
    }

    console.log(' Validating request body:', JSON.stringify(req.body, null, 2));

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,      // Show all errors
      stripUnknown: true      // Remove fields not in schema
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      console.error(' Validation error:', details);
      
      return res.status(400).json({
        error: 'Validation failed',
        details: details
      });
    }

    // Use validated/sanitized value
    req.body = value;
    console.log('Validation passed. Sanitized body:', JSON.stringify(value, null, 2));
    next();
  };
};

module.exports = validate;