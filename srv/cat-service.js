const cds = require('@sap/cds');
const logger = cds.log('TEST');

class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = cds.entities('sap.capire.bookshop');
    const { ListOfBooks } = this.entities;

    // Add some discount for overstocked books
    this.after('each', ListOfBooks, (book) => {
      if (book.stock > 111) book.title += ` -- 11% discount!`;
    });

    // Reduce stock of ordered books if available stock suffices
    this.on('submitOrder', async (req) => {
      let { book: id, quantity } = req.data;
      let book = await SELECT.from(Books, id, (b) => b.stock);
      logger('id : ' + id + ' quantity: ' + quantity + ' stock= ' + book.stock);

      // Validate input data
      if (!book) return req.error(404, `Book #${id} doesn't exist`);
      if (quantity < 1) return req.error(400, `quantity has to be 1 or more`);
      if (quantity > book.stock)
        return req.error(409, `${quantity} exceeds stock for book #${id}`);

      // Reduce stock in database and return updated stock value
      await UPDATE(Books, id).with({ stock: (book.stock -= quantity) });
      return book;
    });

    this.on('AddOrder', async (req) => {
      logger('*******************************');
      let { book: id, quantity } = req.data;
      let book = await SELECT.from(Books, id, (b) => b.stock);

      logger('id : ' + id + ' quantity: ' + quantity + ' stock= ' + book.stock);
      console.log(
        'id : ' + id + ' quantity: ' + quantity + ' stock= ' + book.stock
      );

      // Validate input data
      if (!book) return req.error(404, `Book #${id} doesn't exist`);
      if (quantity < 1) return req.error(400, `quantity has to be 1 or more`);
      // if (quantity > book.stock)
      //   return req.error(409, `${quantity} exceeds stock for book #${id}`);

      // Reduce stock in database and return updated stock value
      await UPDATE(Books, id).with({ stock: (book.stock += quantity) });
      return book;
    });

    // Delegate requests to the underlying generic service
    return super.init();
  }
}

module.exports = CatalogService;
