var chai  = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , cobble = require('cobble')
  , _      = require('lodash')
  , Clank = require('../index');

chai.use(sinonChai);
chai.should();

var concatFunctionResults = new cobble.Descriptor(function(key, values){
      return function(){
        return _.reduce(values, function(str, fn){
          return str += (str ? ' and ' : '' ) + fn()
        }, "")
      }
    })

it( 'should set up the prototype chain correctly', function(){
  var Person = Clank.Object.extend({})
    , Man    = Person.extend({})
    , Jason  = Man.extend({});

  var me = new Jason()

  me.should.be.an.instanceOf(Jason)
    .and.an.instanceOf(Man)
    .and.an.instanceOf(Person)
    .and.an.instanceOf(Clank.Object)
})

it( 'should "inherit" properties', function(){
  var Person = Clank.Object.extend({ species: 'homo sapian'})
    , Man = Person.extend({ gender: 'male' })
    , Jason = Man.extend({ name: 'jason'});

  var me = new Jason()

  me.should.have.a.property('name').that.equals('jason')
  me.should.have.a.property('gender').that.equals('male')
  me.should.have.a.property('species').that.equals('homo sapian')
})

it( 'should reopen correctly', function(){
  var Person = Clank.Object.extend({ species: 'homo sapian'})
    , Man = Person.extend({ gender: 'male' });

  var man = new Man()

  man.should.have.a.property('gender').that.equals('male')
  man.should.not.have.a.property('limbs')
  
  Man.reopen({
    limbs: 4,
    gender: 'irrelevant'
  })

  man.should.have.a.property('gender').that.equals('irrelevant')
  man.should.have.a.property('limbs').that.equals(4)
})


it( 'should handle mixins correctly', function(){
  var Person = Clank.Object.extend({ species: 'homo sapian', limbs: 4 })
    , docOct = { limbs: 8 }
    , Man = Person.extend(docOct, { gender: 'male' });

  var man = new Man()
  man.should.have.a.property('limbs').that.equals(8)
})


it( 'should handle mixin conflicts', function(){
  var Person  = Clank.Object.extend({ greet: function(){ return "hello" } })
    , spanish = { greet: function(){ return "hola" } }
    , german  = { greet: function(){ return "guten morgen" } }

    , GermanSpanishAmerican = Person.extend(spanish, german, { 
        greet: cobble.reduce(functionalConcat) 
      });

  var man = new GermanSpanishAmerican()

  man.greet().should.equal("hello and hola and guten morgen")

  function functionalConcat(target, next){
    return function(){
      return target() + " and " + next()
    }
  }
})


it( 'should respect the specified mixin strategy', function(){
  var Person = Clank.Object.extend({ species: 'homo sapian', traits: [ 'biped', 'hair'] });

  Person.__spec__ = {
    traits: cobble.reduce(function(a,b,i, l){
      if (!a ) return b
      return [].concat(a, b)
    })
  }

  var Hero  = Person.extend({ traits: [ 'brave' ] })
    , Saint = Hero.extend({ traits: [ 'selfless' ] })
    , jimmy = new Hero;

  jimmy.should.have.a.property('traits')
    .that.deep.equals([ 'biped', 'hair', 'brave' ])

  jimmy = new Saint()
  jimmy.should.have.a.property('traits')
    .that.deep.equals([ 'biped', 'hair', 'brave', 'selfless' ])
})