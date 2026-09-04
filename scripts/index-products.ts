import catalog from "../src/data/products.json";
import type { Product } from "../src/types/product";
import {
  PRODUCTS_COLLECTION,
  createTypesenseClient,
  productsCollectionSchema,
  toTypesenseProduct,
} from "../src/lib/typesense";

async function indexProducts() {
  const client = createTypesenseClient();
  const products = catalog as Product[];

  const existing = await client.collections().retrieve();
  const hasCollection = existing.some(
    (collection) => collection.name === PRODUCTS_COLLECTION,
  );

  if (hasCollection) {
    console.log(`Dropping existing collection "${PRODUCTS_COLLECTION}"...`);
    await client.collections(PRODUCTS_COLLECTION).delete();
  }

  console.log(`Creating collection "${PRODUCTS_COLLECTION}"...`);
  await client.collections().create(productsCollectionSchema);

  const documents = products.map(toTypesenseProduct);
  console.log(`Importing ${documents.length} products...`);

  const result = await client
    .collections(PRODUCTS_COLLECTION)
    .documents()
    .import(documents, { action: "upsert" });

  const failed = result.filter((item) => !item.success);
  if (failed.length > 0) {
    console.error("Some documents failed to import:", failed.slice(0, 5));
    process.exitCode = 1;
    return;
  }

  console.log(`Indexed ${documents.length} products into Typesense.`);
}

indexProducts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
