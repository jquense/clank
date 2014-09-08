var chai  = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , cobble = require('cobble')
  , _      = require('lodash')
  , Clank = require('../index');

chai.use(sinonChai);
chai.should();


describe( "when creating objects", function(){

  it( 'should initialize with provided init props', function(){
    var Person = Clank.Object.extend({ greeting: 'guten tag' })
      , Man    = Person.extend({}); 

    var me  = Man.create({ greeting: 'hello'})
      , guy = Man.create()

    guy.should.not.have.ownProperty('greeting')
    guy.should.have.property('greeting').that.equals('guten tag')

    me.should.have.ownProperty('greeting')
      .and.property('greeting').equals('hello')
  })

  it( 'should initialize with provided array of init props', function(){
    var Person = Clank.Object.extend({ greeting: 'guten tag' })
      , Man    = Person.extend({}); 

    var me  = Man.create({ greeting: 'hello'}, { greet: function(){ return this.greeting }})

    me.should.have.ownProperty('greeting')
      .and.have.ownProperty('greet')
      .and.property('greeting').equals('hello')

      me.greet().should.equal(me.greeting)
  })

  it( 'should compose init props', function(){
    var Person = Clank.Object.extend({ greeting: function(){ return 'guten morgen' } })
      , Man    = Person.extend({}); 

    var me  = Man.create(
        { greeting: function(){ return ', hello' }}
      , { greeting: cobble.compose(function(greeting){ 
            return this._super('greeting')() + greeting + ' and good Day'
          })
    })

    me.should.have.ownProperty('greeting')
    me.greeting().should.equal('guten morgen, hello and good Day')
  })

  it( 'should compose respect mixin strategy for init props', function(){
    var Person = Clank.Object.extend({ traits: [ 'biped', 'hair'] });

    Person._setCompositionStrategy({ 
      traits: cobble.concat()
    })

    var Hero  = Person.extend({})
      , Saint = Hero.extend({})
      , jimmy = Hero.create({ traits: [ 'brave' ] });

    jimmy.should.have.a.property('traits')
      .that.deep.equals([ 'biped', 'hair', 'brave' ])

    jimmy = Saint.create({ traits: [ 'brave', 'selfless' ] })
    jimmy.should.have.a.property('traits')
      .that.deep.equals([ 'biped', 'hair', 'brave', 'selfless' ])
  })

})

describe( "when extending objects", function(){

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

    function functionalConcat(target, next) {
      return function(){
        return target.call(this) + " and " + next.call(this)
      }
    }
  })


  it( 'should respect the specified mixin strategy', function(){
    var Person = Clank.Object.extend({ traits: [ 'biped', 'hair'] });

    Person._setCompositionStrategy({
      traits: cobble.concat()
    })

    var Hero  = Person.extend({ traits: [ 'brave' ] })
      , Saint = Hero.extend({ traits: [ 'selfless' ] })
      , jimmy = new Hero;

    jimmy.should.not.have.ownProperty('traits')
    jimmy.should.and.have.a.property('traits')
      .that.deep.equals([ 'biped', 'hair', 'brave' ])

    jimmy = new Saint()
    jimmy.should.not.have.ownProperty('traits')
    jimmy.should.and.have.a.property('traits')
      .that.deep.equals([ 'biped', 'hair', 'brave', 'selfless' ])
  })

})

describe( 'when using super', function(){

  it( 'should call the parent class method', function(){
    var Person = Clank.Object.extend({ greet: function(prefix){ 
          return prefix + " and good day" } })
      , Jason = Person.extend({ greet: function(prefix ){ 
          return prefix + this._super('greet')(" and hello")
        }});

    var me = new Jason()

    me.greet('hi').should.equal('hi and hello and good day')
  })

  it( 'should call the parent and grandparent without recursion', function(){
    var Person = Clank.Object.extend({ greet: function(prefix){ 
          return prefix + " and good day" } })
      , Man = Person.extend({ greet: function(prefix){ 
          return prefix + this._super('greet')(" and excellent weather") } })
      , Jason = Man.extend({ greet: function(prefix ){ 
          return prefix + this._super('greet')(" and hello")
        }});

    var me = new Jason()

    me.greet('hi').should.equal('hi and hello and excellent weather and good day')
  })

  it( 'should call down the stack correctly when skipping a generation', function(){
    var Person = Clank.Object.extend({ 
          greet: function(prefix){ 
            return prefix + " and good day" 
          }   
        })
      , Man   = Person.extend({})
      , Jason = Man.extend({ greet: function(prefix ){ 
          return prefix + this._super('greet')(" and hello")
        }});

    var me = new Jason()

    me.greet('hi').should.equal('hi and hello and good day')
  })

  it( 'should call down the stack correctly when called twice in a method', function(){
    var Person = Clank.Object.extend({ greet: function(prefix){ 
          return prefix + " and good day" } })
      , Man = Person.extend({ greet: function(prefix){ 
            var sup = this._super('greet')
            return prefix + sup(" and excellent weather") + sup(" repeat:")
          } 
        })
      , Jason = Man.extend({ greet: function(prefix ){ 
          return prefix + this._super('greet')(" and hello")
        }});

    var me = new Jason()

    me.greet('hi').should.equal('hi and hello and excellent weather and good day repeat: and good day')
   
  })

  it( 'should work when the method escapes the stack', function(){
    var Person = Clank.Object.extend({ greet: function(prefix){ 
          return prefix + " and good day" } })
      , Man = Person.extend({ greet: function(prefix){ 
            var sup = this._super('greet')
            return sup
          } 
        })
      , Jason = Man.extend({ greet: function(prefix ){ 
          return this._super('greet')
        }});

    var me = new Jason()
      , sup = me.greet()

    var val = sup()('hi')
    val.should.equal('hi and good day')
  })

  it( 'should work when calls are nested', function(){
    var Person = Clank.Object.extend({ 
          greet: function(prefix){ 
            return prefix + " 3" 
          } 
        })
      , Man = Person.extend(
        cobble({
          greet: function(prefix ){ 
            return prefix + " 2a"
          }
        },
        { 
          greet: cobble.compose(function(prefix ){ 
            return this._super('greet')(prefix + " 2b")
          })
        }))
      , Jason = Man.extend({ 
          greet: function(prefix ){ 
            return this._super('greet')(prefix + " 1")
          }
        });

    var me = new Jason()

    me.greet('start:').should.equal('start: 1 2a 2b 3')


  })

  it( 'should throw when called outside a method', function(){
    var Person = Clank.Object.extend({ 
          greet: function(prefix){ 
            return prefix + " and good day" 
          } 
        })
      , Jason = Person.extend({ 
          greet: function(prefix ){ 
            return prefix + this._super('greet')(" and hello")
          }
        });

    var me = new Jason()

    th.should.throw(Error, "`super` may not be called outside a method implementation")

    function th(){
      me._super('greet')('hello')
    }
  })

  /**
   * this is a good example of the perils of this approach, async stuff is going to mess up
   * super's ability to keep track of where it is in the chain, so the super must be gotten outside the timeout.
   * subtle stuff like this is the reason super is underscored 
   */   
  it( 'should sort of work in a timeout', function(done){
    
    var obj = { value: 0 } 

    var Human = Clank.Object.extend({ 
          greet: function(prefix, cb){ 
            setTimeout(function(){
              cb(prefix + " Forth")
            }, 0)
          } 
        })

    var Person = Human.extend({ 
          greet: function(prefix, cb){ 
            var self = this
              , sup = self._super('greet');

            setTimeout(function(){
              sup(prefix + " Third", cb)
            }, 0)
          } 
        })

    var Man = Person.extend({ 
          greet: function(prefix, cb){ 
            var self = this
              , sup = self._super('greet');

            setTimeout(function(){
              sup(prefix + " Second", cb)
            }, 0)
          } 
        })

    var Jason = Man.extend({ 
          greet: function(prefix, cb ){ 
            var self = this
              , sup = self._super('greet');

            setTimeout(function(){
              sup(prefix + " First", cb)
            }, 0)
          }
        });

    var me = new Jason()
    
    me.greet("start", function(result){
      //console.log(result)
      result.should.equal('start First Second Third Forth')
      done()
    })
  })
})