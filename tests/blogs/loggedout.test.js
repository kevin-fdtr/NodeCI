const Page = require('../helpers/page')

let page

beforeEach( async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000')
})

afterEach( async () => {
  await page.close()
})

describe('When not logged in', async () => {
  const actions = [
    { method: 'get', path : '/api/blogs'},
    { method: 'post', path : '/api/blogs', data: { title: 'Test Title', content: 'Test Content' } }
  ]

  test('Blog related actions are prohibited', async () => {
    const results = await page.executeRequests(actions)
    for (let result of results) {
      expect(result).toEqual({error: 'You must log in!'})
    }
  })  
})
