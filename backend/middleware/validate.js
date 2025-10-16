// middleware/validate.js
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

module.exports = validate;