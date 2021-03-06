const Page = require('../helpers/page')

let page

beforeEach( async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000')
})

afterEach( async () => {
  await page.close()
})

describe('When logged in', async () => {
  beforeEach( async () => {
    await page.login()
    await page.click('a.btn-floating')
  })

  test('can see blog create form', async () => {    
    const label = await page.getContentsOf('form label')

    expect(label).toEqual('Blog Title')
  })

  describe('and presing next with valid inputs', async () => {
    beforeEach( async () => {
      await page.type('.title input', 'My title')
      await page.type('.content input', 'My content')
      await page.click('form button')
      
    })

    test('submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5')

      expect(text).toEqual('Please confirm your entries')
    })

    test('submitting then saving adds blog', async () => {
      await page.click('button.green')
      await page.waitFor('.card')
      title = await page.getContentsOf('.card-title')
      content = await page.getContentsOf('p')

      expect(title).toEqual('My title')
      expect(content).toEqual('My content')
    })
  })

  describe('and presing next with invalid inputs', async () => {
    beforeEach( async () => {
      await page.click('form button')
    })
    test('the form shows title and content error messages', async () => {
      const titleError = await page.getContentsOf('.title .red-text')
      const contentError = await page.getContentsOf('.content .red-text')
      
      expect(titleError).toEqual('You must provide a value')
      expect(contentError).toEqual('You must provide a value')
    })
  })

})
