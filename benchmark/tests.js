var Benchmark = require('benchmark')
  , _ = require('lodash')
  , Clank = require('../index')
  , OldClank = require('./clank/index')
  , suites = [];

global.Clank = Clank
global.OldClank = OldClank

var current = 'current: ' + require('../package.json').version
  , last =  'last: ' + require('./clank/package.json').version


_.extend(Benchmark.Suite.options, {
  onStart: function(){ 
    console.log('\n' + this.name + ':') 
  },
  onComplete: require('./setup').onSuiteComplete(suites, current, last)
})


_.extend(Benchmark.options, {
  setup: function(){
    var clank = global.Clank
      , oldClank = global.OldClank;

    var current = {
      flat: getFlatMixins(clank)
    }

    var old = {
      flat: getFlatMixins(oldClank)
    }

    var BaseCurrentObject = clank.Object.extend(current.flat[0])
      , BaseOldObject = clank.Object.extend(old.flat[0])

    function getFlatMixins(clank){
      return [{
          a: function(){
            return 'hello'
          },
          b: 50,
          c: [1,2,3,4],
          d: [{ a: 'bergf' },{ a: 'bergf' },{ a: 'bergf' }],
          e: function(){ this.b += 50 } 
        },
        {
          a: clank.compose(function(last){
            return last + ' steve'
          }),
          h: 50,
          c: clank.concat([1,2,3,4]),
          i: function(){ this.b += 50 } 
        },
        {
          a: clank.compose(function(last){
            return last + ' smith'
          }),
          e: clank.before(function(){
            this.b += 25
          }) 
        }
      ]
    }

  }
})

suites.push(
  Benchmark.Suite('object declaration')
    .add(current, {
      fn: function(){
        Clank.Object.extend(current.flat[0])
      }
    })
    .add(last, function(){
      Clank.Object.extend(old.flat[0])
    })
)

suites.push(
  Benchmark.Suite('object inheritance')
    .add(current, function(){
      Clank.Object
        .extend(current.flat[0])
        .extend(current.flat[1])
        .extend(current.flat[2])
    })
    .add(last, function(){
      Clank.Object
          .extend(old.flat[0])
          .extend(old.flat[1])
          .extend(old.flat[2])
    })
)

suites.push(
  Benchmark.Suite('inherited object creation')
    .add(current, function(){
      BaseCurrentObject.create(current.flat[1])
    })
    .add(last, function(){
      BaseOldObject.create(old.flat[1])
    })
)

suites[0].run({ async: true })





