const router = require('express').Router();
const jose = require('jose');
const set_data = require('./class');

const patientRouter = require('./router/PatientRouter');
const observationRouter = require('./router/ObservationRouter');

const authRouter = require('./router/AuthRouter');

const { verifyJWT } = require('./middleware/AuthMiddleware');

const wellKnown = require('./utils/wellKnown');
const openId = require('./utils/openId');
const metadata = require('./utils/metadata');
const { getPublicKey } = require('./utils/keys');

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

router.use('/auth', authRouter);

router.use('/baseR4/Patient', verifyJWT, patientRouter);
router.use('/baseR4/Observation', verifyJWT, observationRouter);

router.get('/render', (req, res) => {
  const data = new set_data(req.query['id']);

  res.json({ res: JSON.parse(data.getShaHead()) });
});

router.get('/dashboard', (req, res) => {
  res.render('index');
});

router.get('/.well-known/smart-configuration', (req, res) => {
  res.json(wellKnown);
});

router.get('/.well-known/openid-configuration', (req, res) => {
  res.json(openId);
});

router.get('/key', async (req, res) => {
  const file = await getPublicKey();
  const key = await jose.importSPKI(file.toString(), 'RS256');
  res.json(await jose.exportJWK(key));
});

router.get('/baseR4/metadata', (req, res) => {
  res.json(metadata);
});

router.get('/', (req, res) => {
  res.json({ res: res.statusCode });
});

module.exports = router;
