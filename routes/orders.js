const Router = require('koa-router');
const uuid = require('uuid').v4;

const ordersRouter = new Router({ prefix: '/orders' });
const ordersData = require('../lib/orders');

totalItems = (items) => {
    total = items.reduce((orderTotal, item) => orderTotal += (item.price*item.quantity), 0)
    return total;
}
ordersRouter.post('/', async ctx => {
    const { customerName, items } = ctx.request.body;

    if (!items.length) {
        ctx.throw(409, 'No items ordered')
    }
    
    const price = totalItems(items);
    const order = {
        id: uuid(),
        customerName,
        createdOn: new Date(),
        items,
        price
    }

    ctx.status = 201;
    ctx.body = [ ...ordersData, order ];
});

ordersRouter.get('/', async ctx => {
    const { filterProperty, filterValue } = ctx.query;

    let results = ordersData;

    if (filterProperty && filterValue) {
        const filteredResults = ordersData.filter(({ items }) => 
            items.some(item => item[filterProperty].includes(filterValue))
        )
        results = filteredResults;
    }

    ctx.status = 200;
    ctx.body = results;
});

ordersRouter.get('/:id', async ctx => {
    const { id } = ctx.params;
    const order = ordersData.find(order => order.id === id)

    if (!order) {
        ctx.throw(404, 'Order not found')
    }

    ctx.status = 200;
    ctx.body = order;
});

ordersRouter.patch('/:id', async ctx => {
    const { id } = ctx.params;
    const { customerName, items } = ctx.request.body;

    const order = ordersData.find(order => order.id === id);

    if(!order) {
        ctx.throw(404, 'Could not find order');
    }

    const uCustomerName = customerName?customerName:order.customerName;
    const uItems = items?items:order.items;
    const price = totalItems(uItems);
    const updated = {
        ...order,
        uCustomerName,
        uItems,
        price
    }

    ctx.status = 200;
    ctx.body = updated;
});

ordersRouter.put('/:id', async ctx => {
    const { id } = ctx.params;
    const { customerName, items } = ctx.request.body;

    const order = ordersData.find(order => order.id === id);

    if(!order) {
        ctx.throw(404, 'Could not find order');
    }

    const price = totalItems(items);
    const updated = {
        ...order,
        customerName,
        items,
        price
    }

    ctx.status = 200;
    ctx.body = updated;
});

ordersRouter.delete('/:id', async ctx => {
    const { id } = ctx.params;

    const order = ordersData.find(order => order.id === id);

    if(!order) {
        ctx.throw(404, 'Could not find order');
    }

    const remaining = ordersData.filter(({ id }) => id !== order.id);

    ctx.status = 200;
    ctx.body = remaining;
});

module.exports = ordersRouter;
