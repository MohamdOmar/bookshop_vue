import { createApp, ref, reactive } from 'vue'
import cds from './cap.js'

const { GET, POST } = await cds.connect.to ('/rest/catalog')
createApp ({ setup() {

  const $ = sel => document.querySelector(sel)
  const books = ref([]), book = ref(undefined)
  const order = reactive({ quantity:1 })
  const message = reactive({ reset() { this.succeeded = this.failed = undefined } })

  return {
    books, book, order, message, Ratings: { get undefined() { return this [Math.round(Math.random()*5)] },
      0: '☆☆☆☆☆',
      1: '★☆☆☆☆',
      2: '★★☆☆☆',
      3: '★★★☆☆',
      4: '★★★★☆',
      5: '★★★★★',
    },

    async fetch (pattern, $search = pattern ? `&$search=${pattern}` : '') {
      const { data } = await GET `/ListOfBooks?$expand=genre($select=name),currency($select=symbol)${$search}`
      books.value = data
    },

    async inspect (index) { message.reset()
      const { ID } = book.value = books.value [index]
      const { data } = await GET `/Books/${ID}?$select=descr,stock`
      Object.assign (book.value, data)
      Object.assign (order, { book: ID, quantity: 1 })
      setTimeout (()=> $('form > input').focus(), 111)
    },

    async submitOrder() { message.reset()
      try {
        const { data } = await POST (`/submitOrder`, order)
        message.succeeded = `Successfully ordered ${order.quantity} item(s).`
        book.value.stock = data.stock
      } catch (e) {
        message.failed = e.response.data.error ? e.response.data.error.message : e.response.data
      }
    },
  }

}}) .mount('#app') .fetch() // initially fill list of books
