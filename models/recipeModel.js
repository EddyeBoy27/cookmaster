const { getSession } = require('./connection');

const getRecipesFromDataBase = async () => {
  const session = await getSession();
  const results = await
  session.sql(
      `SELECT r.id, r.name, u.name, u.last_name
      FROM cookmaster.recipes AS r
      INNER JOIN users AS u ON u.id = r.author_id;`,
    )
    .execute()
    .then((executeResult) => executeResult.fetchAll())
    .then((recipeResult) => {
      if (!recipeResult) return null;
      return recipeResult.map(
        ([id, recipeName, userName, userLastName]) => ({
          id,
          recipeName,
          userName,
          userLastName,
        }),
      );
    });
  return results;
};

const getRecipeDetails = async (paramId) => {
  const session = await getSession();
  const results = await
  session.sql(
      `SELECT id, name, ingredients, prepare_method, author_id
      FROM recipes
      WHERE id = ?;`,
    )
    .bind(paramId)
    .execute()
    .then((recipeResults) => recipeResults.fetchAll())
    .then((recipeDetail) => recipeDetail[0]);
  if (!results) return null;
  const [id, name, ingredients, prepareMethod, authorId] = results;
  return { id, name, ingredients, prepareMethod, authorId };
};

const createRecipe = async (name, ingredients, prepareMethod, id) => {
  const session = await getSession();
  return session.sql(`INSERT INTO recipes (name, ingredients, prepare_method, author_id)
    VALUES
      (?, ?, ?, ?);`)
    .bind(name)
    .bind(ingredients)
    .bind(prepareMethod)
    .bind(id)
    .execute();
};

const editRecipe = async (name, ingredients, prepareMethod, recipeId, id) => {
  const session = await getSession();
  return session.sql(`UPDATE recipes
  SET
  name = ?,
  ingredients = ?,
  prepare_method = ?
  WHERE
  id = ?
  AND
  author_id = ?;`)
  .bind(name)
  .bind(ingredients)
  .bind(prepareMethod)
  .bind(recipeId)
  .bind(id)
  .execute();
};

const deleteRecipe = async (id, userId) => {
  const session = await getSession();
  return session.sql(`DELETE FROM recipes
  WHERE id = ?
  AND author_id = ?;`)
  .bind(id)
  .bind(userId)
  .execute();
};

const searchRecipe = async (query) => {
  const session = await getSession();
  const results = await session.sql(`SELECT r.id, r.name, u.name, u.last_name
  FROM cookmaster.recipes AS r
  INNER JOIN users AS u ON u.id = r.author_id
  WHERE r.name REGEXP ?;`)
  .bind(query)
  .execute()
    .then((recipeResults) => recipeResults.fetchAll())
    .then((recipeDetail) => {
      if (!recipeDetail) return null;
      return recipeDetail.map(
        ([id, recipeName, userName, userLastName]) => ({
          id,
          recipeName,
          userName,
          userLastName,
        }),
      );
    });
  return results;
};

module.exports = {
  getRecipesFromDataBase,
  getRecipeDetails,
  createRecipe,
  editRecipe,
  deleteRecipe,
  searchRecipe,
};
