const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

describe('Message Management Routes', () => {
    let channelId = 1;

    //Send a message
    describe('POST /send', () => {
        it('should send a message successfully', (done) => {
            chai.request(server)
                .post('/manageMessages/send')
                .send({
                    channelId: channelId,
                    username: 'testuser',
                    avatar: 'http://example.com/avatar.png',
                    text: 'Hello, this is a test message.'
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').eql('Message sent successfully');
                    expect(res.body).to.have.property('sentMessage').that.is.an('object');
                    expect(res.body.sentMessage).to.have.property('channelId').eql(channelId);
                    expect(res.body.sentMessage).to.have.property('username').eql('testuser');
                    expect(res.body.sentMessage).to.have.property('avatar').eql('http://example.com/avatar.png');
                    expect(res.body.sentMessage).to.have.property('text').eql('Hello, this is a test message.');
                    done();
                });
        });
    });

    //Get messages for a specific channel
    describe('GET /:channelId', () => {
        it('should fetch messages for a specific channel', (done) => {
            chai.request(server)
                .get(`/manageMessages/${channelId}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });
});
