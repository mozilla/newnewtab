// Add a random method to all arrays, because it's handy.
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};
