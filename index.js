/*jshint node:true */
"use strict";

var combine = require('stream-combiner');

function validateStep(step) {
  if (!step) {
    throw new Error('Invalid call to lazypipe().pipe(): no stream creation function specified');
  } else if (typeof step !== 'function') {
    throw new Error('Invalid call to lazypipe().pipe(): argument is not a function.\n' +
                    '    Remember not to call stream creation functions directly! e.g.: pipe(foo), not pipe(foo())');
  }
}

function validateSteps(steps) {
  if (steps.length === 0) {
    throw new Error('Tried to build a pipeline with no pipes!');
  }
}

function Lazypipe(steps) {
  this.steps = steps;
  this.go = this.go.bind(this);
  this.go.pipe = this.pipe.bind(this);

  return this.go;
}

Lazypipe.prototype.pipe = function (step) {
  validateStep(step);

  return new Lazypipe(this.steps.concat({
    task: step,
    args: Array.prototype.slice.call(arguments, 1)
  }));
};

Lazypipe.prototype.go = function () {
  validateSteps(this.steps);

  return combine.apply(null, this.steps.map(function (step) {
    return step.task.apply(null, step.args);
  }));
};

module.exports = function () {
  return new Lazypipe([]);
};