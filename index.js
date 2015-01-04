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

function createPipeline(steps) {
  function Pipeline() {
    validateSteps(steps);

    return combine.apply(null, steps.map(function (t) {
      return t.task.apply(null, t.args);
    }));
  }
  
  Pipeline.appendStepsTo = function (otherSteps) {
    return otherSteps.concat(steps);
  };
  
  Pipeline.pipe = function (step) {
    validateStep(step);

    // avoid creating nested pipelines
    if (step.appendStepsTo) {
      return createPipeline(step.appendStepsTo(steps));
    }

    return createPipeline(steps.concat({
      task: step,
      args: Array.prototype.slice.call(arguments, 1)
    }));
  };
  
  return Pipeline;
}

module.exports = function () {
	return createPipeline([]);
};