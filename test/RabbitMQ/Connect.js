'use strict';

const testUtilities = require('@itavy/test-utilities');
const { RabbitMQTransport } = require('../../lib/RabbitMQTransport');
const fixtures = require('./Fixtures');

const expect = testUtilities.getExpect();

describe('Connect', () => {
  let sandbox;
  let testConnector;

  beforeEach((done) => {
    sandbox = testUtilities.getSinonSandbox();
    testConnector = Reflect.construct(RabbitMQTransport, [fixtures.RabbitMqDeps]);
    done();
  });

  afterEach((done) => {
    sandbox.restore();
    testConnector = null;
    done();
  });

  it('Should call amqplib connect', () => {
    const connectStub = sandbox.stub(fixtures.amqpLibMock, 'connect').throws(fixtures.testingError);
    return testConnector.connect()
      .should.be.rejected
      .then((error) => {
        fixtures.testExpectedError({ error });

        expect(connectStub.callCount).to.be.equal(1);
        expect(connectStub.getCall(0).args).to.be.eql([[fixtures.rabbitMqParsedUri]]);

        return Promise.resolve();
      });
  });

  it('Should set connection', () => {
    sandbox.stub(fixtures.amqpConnectionMock, 'createChannel')
      .throws(fixtures.testingError);
    return testConnector.connect()
      .should.be.rejected
      .then((error) => {
        fixtures.testExpectedError({ error });

        expect(testConnector.connection).to.be.equal(fixtures.amqpConnectionMock);

        return Promise.resolve();
      });
  });

  it('Should set connection `connect` and `disconnect` event handlers and emit events when connection is broken or restored', () => {
    const connectEventData = {
      connection: {},
      url:        '',
    };
    const diconnectEventData = {
      err: new Error(),
    };
    const connectionEventHandlers = {};

    sandbox.stub(fixtures.amqpConnectionMock, 'on').callsFake((eventName, eventHandler) => {
      connectionEventHandlers[eventName] = eventHandler;
    });
    sandbox.stub(fixtures.amqpConnectionMock, 'isConnected')
      .withArgs()
      .onFirstCall()
      .returns(true)
      .onSecondCall()
      .returns(false);

    const onTestConnectorDisconnectSpy = sandbox.spy();
    const onTestConnectorConnectSpy = sandbox.spy();

    testConnector.on('disconnect', onTestConnectorDisconnectSpy);
    testConnector.on('connect', onTestConnectorConnectSpy);

    return testConnector.connect().then(() => {
      connectionEventHandlers.connect(connectEventData);
      connectionEventHandlers.connect(connectEventData);
      connectionEventHandlers.disconnect(diconnectEventData);
    }).then(() => {
      expect(onTestConnectorConnectSpy.getCall(0).args).to.be.eql([{
        connection: connectEventData.connection,
        url:        connectEventData.url,
      }]);
      expect(onTestConnectorConnectSpy.callCount).to.be.eql(1);
      expect(onTestConnectorDisconnectSpy.getCall(0).args).to.be.eql([{
        error: diconnectEventData.err,
      }]);
    }).finally(() => {
      testConnector.off('connect', onTestConnectorConnectSpy);
      testConnector.off('disconnect', onTestConnectorDisconnectSpy);
    });
  });

  it('Should set channel', () => testConnector.connect()
    .should.be.fulfilled
    .then(() => {
      expect(testConnector.channel).to.be.equal(fixtures.amqpChannelMock);

      return Promise.resolve();
    }));

  it('Should resolve on subsequent calls', () => {
    const connectSpy = sandbox.spy(fixtures.amqpLibMock, 'connect');
    return testConnector.connect()
      .then(() => testConnector.connect())
      .should.be.fulfilled
      .then(() => {
        expect(connectSpy.callCount).to.be.equal(1);

        return Promise.resolve();
      });
  });
});

