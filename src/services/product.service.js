const repository = require("../repositories/product.repository");

const getProducts = async () => {

    const products = await repository.getAllProducts();

    return products.map(product => {

        const stock = product.variants.reduce((total, variant) => {

            if (!variant.inventory || variant.inventory.length === 0)
                return total;

            return total + (variant.inventory[0].stock || 0);

        }, 0);

        return {

            id: product.id,

            sku: product.variants[0]?.sku ?? "",

            name: product.name,

            category: product.category.name,

            brand: product.brand?.name ?? "",

            price: Number(product.variants[0]?.price ?? 0),

            variants: product.variants.length,

            stock,

            active: product.active

        };

    });

};

const getProductById = async (id) => {

    return repository.getProductById(id);

};
const updateProduct = async (id, data) => {

    return repository.updateProduct(id, data);

};

const updateVariant = async (id, data) => {

    return repository.updateVariant(id, data);

};

const createVariant = async (data) => {

    return repository.createVariant(data);

};

const createProduct = async (data) => {

    return repository.createProduct({

        ...data,

        companyId: "f554ccd8-7a9c-45bc-85e0-b928bcea5c09"

    });

};

const generateSku = async (prefix) => {

    const lastSku = await repository.getLastSku(prefix);

    if(!lastSku){

        return `${prefix}-001`;

    }

    const lastNumber = Number(

        lastSku.sku.split("-").pop()

    );

    const next = String(

        lastNumber + 1

    ).padStart(3,"0");

    return `${prefix}-${next}`;

};

module.exports = {

    getProducts,
    getProductById,
    updateProduct,
    updateVariant,
    createVariant,
    createProduct,
    generateSku
};