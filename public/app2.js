document.addEventListener('DOMContentLoaded', () => {
  const App = angular.module('myApp', []);

  App.controller('myController', ['$scope', function($scope, $http) {
    // console.log('controller loaded', $scope);

    $scope.isLoading = false;
    $scope.articles = [];

    $scope.isSavedPage = window.location.href.includes('saved');

    $scope.startScrape = function () {
      $scope.isLoading = true;
      fetch(`/scrape`).then(r => r.json()).then((data) => {
        $scope.isLoading = false;
        console.log(data);
        $scope.showArticles();
        $scope.$apply();
      });
    };

    $scope.showArticles = function (saved) {
      $scope.isLoading = true;
      fetch(`/articles/${saved}`).then(r => r.json()).then((data) => {
        $scope.isLoading = false;
        $scope.articles = data;
        console.log(data);
        $scope.$apply();
      });
    }

    $scope.saveArticle = function (article) {
      // console.log(article);
      $scope.isLoading = true;
      fetch(`/save/${article._id}`, { method: 'POST' }).then(r => r.json()).then((data) => {
        $scope.isLoading = false;
        const index = $scope.articles.findIndex((a) => a === article);
        $scope.articles.splice(index, 1);
        console.log(data);
        $scope.$apply();
      });
    }

    $scope.deleteArticle = function (article) {
      // console.log(article);
      $scope.isLoading = true;
      fetch(`/articles/${article._id}`, { method: 'DELETE' }).then(r => r.json()).then((data) => {
        $scope.isLoading = false;
        const index = $scope.articles.findIndex((a) => a === article);
        $scope.articles.splice(index, 1);
        console.log(data);
        $scope.$apply();
      });
    }

    $scope.clearArticles = function () {
      // console.log(article);
      $scope.isLoading = true;
      fetch(`/clear`, { method: 'GET' }).then(r => r.json()).then((data) => {
        $scope.isLoading = false;
        $scope.articles = [];
        console.log(data);
        $scope.$apply();
      });
    }

    $scope.showArticles($scope.isSavedPage);
  }]);
});