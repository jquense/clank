Clank
========

A simple prototypal inheritance abstraction with an emphasis on composition. Barely more then a few helpers, built on top of [cobble](https://github.com/theporchrat/cobble/) for trait-like mixins. If you used Backbone or Ember this API should feel familiar.

## API

require the module; 

  var Clank = require('clank')

Clank comes with a single `Clank.Object` class that provides a starting base class for any objects you want.

### Clank.Object.extend(...spec)

Every Constructor returned from `.extend()` also has an extend method.

    var Human = Clank.Object.extend({ species: 'Homo Sapien' })
    var Jimmy = Human.extend({ name: Jimmy })

    new Jimmy

You can also pass in multiple spec objects and make use of Clanks, underlying use of cobble. 

    var Person = Clank.Object.extend({ species: 'homo sapian', limbs: 4 })
      , docOctMixin = { limbs: 8 }
      , DocOct = Person.extend(docOct, { gender: 'male' });

    var doc = new DocOct()
    doc.limbs // => 8

you can also you compositional descriptors to handle overrides and super calls. __See the cobble documentation for more information on descriptors__

    var EnglishSpeaker  = Clank.Object.extend({ greet: function(){ return "hello" } })

    var spanishGreeting = { greet: function(){ return "hola" } }
    var germanGreeting  = { greet: function(){ return "guten morgen" } }

    var GermanSpanishAmerican = EnglishSpeaker.extend(spanishGreeting, germanGreeting, { 
          greet: Clank.reduce(function (target, next) {
            return function(){
              return target.call(this) + " and " + next.call(this)
            }
          }) 
        });

    var person = new GermanSpanishAmerican()

    person.greet() // => "hello and hola and guten morgen"

### AnyClass.reopen(...spec)

`.reopen` is like extend but `.extend` of creating a new Class it alters the current class prototype. Changes made to the prototype will cascade throguh the object heirarchy. `.reopen` has the same signature as `.extend`.

    var Person = Clank.Object.extend({ species: 'homo sapien'})
      , Man    = Person.extend({ gender: 'male' });

    var man = new Man()

    man.gender // => 'male'
    man.limbs  // => undefined
    
    Man.reopen({
      limbs: 4,
      gender: 'irrelevant'
    })

    man.gender // => 'irrelevant'
    man.limbs  // => 4


### AnyClass.create(...properties)

Returns an instance of the object with instance properties set to the passed in object, or array of objects

    var Person = Clank.Object.extend({ greeting: 'guten tag' }); 

    var me  = Person.create({ greeting: 'hello'})
      , friend = Person.create()

    me.hasOwnProperty('greeting')     // => true
    me.greeting                       // => 'hello'

    friend.hasOwnProperty('greeting') // => false
    friend.greeting                   // => 'guten tag'


## Super Calls

Clank _does_ have a `super` implementation but you probably don't need it. The majority of super use cases, can be solved by simple doing `Parent.prototype[method].call(this, [args]` in cases where this is possible it is the recommended way to do it. 

In a few cases where you need to dynamically reference the super class, super han be accessed by `this._super([method]) => returns the method` inside a class method, however, there are a bunch of pitfalls and caveats related to its use, which is why it is __underscored__. Consult the super tests for insight into the limitations of this method.