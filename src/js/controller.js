import * as model from "./model.js"
import { MODAL_CLOSE_SEC } from "./config.js"
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import paginationView from './views/paginationView.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
    module.hot.accept();


}

const controlRecipes = async function() {
    try {
        //whenever change # in url
        const id = window.location.hash.slice(1);
        if (!id) return;


        recipeView.renderSpinner();

        //update results view to mark selected search results
        resultsView.update(model.getSearchResultsPage()); //show the loading image
        bookmarksView.update(model.state.bookmarks);
        //1.loading recipe
        await model.loadRecipe(id);

        //2. rendering recipe
        recipeView.render(model.state.recipe); //show the recipe after load

    } catch (err) {

        recipeView.renderError();
    }

};




const controlSearchResults = async function() {
    try {

        //1.get search query
        const query = searchView.getQuery();
        if (!query) return;


        resultsView.renderSpinner();
        //2.load research results
        await model.loadSearchResults(`${query}`);

        //3.render results
        resultsView.render(model.getSearchResultsPage());


        //4.render initial pagination buttons
        paginationView.render(model.state.search);



    } catch (err) {
        console.log(err);
    }

};

controlSearchResults();


const controlPagination = function(goToPage) {
    resultsView.render(model.getSearchResultsPage(goToPage));

    paginationView.render(model.state.search);
};

const controlServings = function(newServings) {

    //update the recipe servings for (in state)
    model.updateServings(newServings);
    recipeView.update(model.state.recipe);

    //update the recipe view
};

const controlAddBookmark = function() {
    //1） add / remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);
    //2) update recipe view
    recipeView.update(model.state.recipe);

    //3) render bookmarks
    bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function() {
    bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
    try {
        //upload new recipe data
        await model.uploadRecipe(newRecipe);

        //render recipe 
        recipeView.render(model.state.recipe);

        //success message
        addRecipeView.renderMessage();

        //render bookmark view
        bookmarksView.render(model.state.bookmarks);

        //change id in url without reloading the page
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // close form window
        setTimeout(function() {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000)

    } catch (err) {
        console.error(err);
        addRecipeView.renderError(err.message);
    }

}

const init = function() {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);

};

init();