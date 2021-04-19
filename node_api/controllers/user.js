const APIError = require('../rest').APIError;

module.exports = {
    'GET /api/user': async (ctx, next) => {
        ctx.rest();
    },

    'POST /api/user': async (ctx, next) => {
        ctx.rest();
    },

    'DELETE /api/user/:id': async (ctx, next) => {
        console.log(`delete product ${ctx.params.id}...`);
        if (p) {
            ctx.rest();
        } else {
            throw new APIError('product:not_found', 'product not found by id.');
        }
    }
};