const maybe = process.env.RUN_INTEGRATION_TEST ? describe : describe.skip;
const app = require('../index');
const db = require('../persistence');
const frisby = require('frisby');
const uuid = require('uuid-v4');
const logger = require('../log')('api.test');
const config = require('../config');
const baseUrl = 'http://localhost:8080'
;

frisby.globalSetup({
  request: {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${config.admin.user}:${config.admin.pass}`).toString('base64'),
    },
  },
});

maybe('API', () => {
  beforeAll( async () => {
    await app.startPromise;
  });

  afterAll( () =>{
    app.server.close();
  });

  test('Health check', () => {
    logger.info('Calling health');
    return frisby.get(`${baseUrl}/health`)
        .expect('status', 200)
        .expect('json', 'status', 'ok')
        .promise();
  });

  test('v1 api', async () => {
    let obj = {name: 'adamatti'};

    // Save
    obj = await db.save('persons', obj);

    // Find
    const rowFromDb = await db.findById('persons', obj.id);
    expect(rowFromDb.id).toBe(obj.id);

    // Find from API (by id)
    await frisby.get(`${baseUrl}/rest/v1/persons/${obj.id}`)
        .expect('status', 200)
        .expect('json', 'id', obj.id)
        .promise();

    // Find (using filter)
    return frisby.get(`${baseUrl}/rest/v1/persons?id=${obj.id}`)
        .expect('status', 200)
        .expect('json', '[0].id', obj.id)
        .promise();
  });

  test('v1 404', () => {
    return frisby.get(`${baseUrl}/rest/v1/persons/unknown`)
        .expect('status', 404)
        .promise();
  });

  test('v2 api', async () => {
    const obj = {id: uuid(), name: 'adamatti'};
    await db.save('persons', obj);

    return frisby.get(`${baseUrl}/rest/v2/persons/${obj.id}`)
        .expect('status', 200)
        .expect('json', 'data[0].id', obj.id)
        .promise();
  });

  test('v2 404', () => {
    return frisby.get(`${baseUrl}/rest/v2/persons/unknown`)
        .expect('status', 404)
        .promise();
  });
});
