'use strict';

const maybe = process.env.RUN_INTEGRATION_TEST ? describe : describe.skip;
const mongoPersistence = require('./mongoPersistence');

maybe('mongo-persistence', () => {
  const tableName = 'personUnitTest';

  it('test list', ()=> {
    return mongoPersistence.list(tableName);
  });

  it('test crud', async ()=> {
    let person = {id: 'adamatti', name: 'Adamatti'};
    await mongoPersistence.save(tableName, person);

    // Find by id
    person = await mongoPersistence.findById(tableName, person.id);
    expect(person.name).toBe('Adamatti');

    // Delete
    await mongoPersistence.delete(tableName, person.id);
  });
});
