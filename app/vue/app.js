import { createApp, reactive, ref } from './vue.js';
import cds from './cap.js';

const { GET, POST } = cds.connect.to('/rest/catalog');
const $ = (s) => document.querySelector(s);

createApp({
  setup() {
    const stars = ['☆☆☆☆☆', '★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'];
    const books = ref([]),
      details = ref();
    const order = reactive({ quantity: 1 });
    const SecOrder = reactive({ quantity: 1 });

    return {
      books,
      details,
      order,
      stars,
      SecOrder,

      async fetch(input) {
        let $ = Number(input);
        books.value =
          await GET`ListOfBooks?$expand=genre($select=name),currency($select=symbol)${
            $
              ? isNaN($)
                ? `&$search=${$}`
                : Number.isInteger($)
                ? `&$filter=price eq ${$} or stock eq ${$}`
                : `&$filter=price eq ${$}`
              : ''
          }`;
      },

      async inspect(index) {
        let b = (details.value = books.value[index]),
          ID = (order.book = b.ID);
        Object.assign(b, await GET`Books/${ID}?$select=descr,stock`);
        setTimeout(() => $('form > input').focus(), 11); // focus input field after rendering
        order.succeeded = order.failed = undefined; // reset messages displayed before
      },

      async submitOrder() {
        order.succeeded = order.failed = undefined; // reset messages displayed before
        try {
          let { book, quantity } = order;
          console.log('order : .... ' + order);
          console.log('order.quantity : .... ' + order.quantity);
          let { stock } = await POST(`submitOrder`, { book, quantity });
          console.log('stock =  ' + stock);
          order.succeeded = `Successfully ordered ${order.quantity} item(s).`;
          details.value.stock = stock;
        } catch (e) {
          order.failed = e.message;
          throw e;
        }
      },

      async AddOrder() {
        SecOrder.succeeded = SecOrder.failed = undefined; // reset messages displayed before
        try {
          let { book, quantity } = order;
          quantity = SecOrder.quantity;
          console.log('SecOrder : .... ' + SecOrder);
          console.log('SecOrder : .... ' + SecOrder.quantity);
          let { stock } = await POST(`AddOrder`, { book, quantity });
          console.log('stock =  ' + stock);
          order.succeeded = `Successfully added ${SecOrder.quantity} item(s).`;
          details.value.stock = stock;
        } catch (e) {
          order.failed = e.message;
          throw e;
        }
      },
    };
  },
})
  .mount('#app')
  .fetch(); // initially fill list of books
$('#app > input').focus();
