const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

describe('Channel Management Routes', () => {
    let channelId;

    //Create a channel
    it('should create a new channel', (done) => {
        chai.request(server)
            .post('/manageChannel/create')
            .send({ name: 'Test Channel', groupId: 1 })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('message').eql('Channel created successfully');
                channelId = res.body.channel.id;
                done();
            });
    });

    //create a channel without a name (fail)
    it('should return 500 when creating a channel without a name', (done) => {
        chai.request(server)
            .post('/manageChannel/create')
            .send({ groupId: 1 })
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.have.property('message').eql('Error creating channel. Name and groupId are required.');
                done();
            });
    });

    //Delete an existing channel
    it('should delete an existing channel', (done) => {
        chai.request(server)
            .delete(`/manageChannel/delete/${channelId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').eql('Channel deleted successfully');
                done();
            });
    });

    //Delete a non-existent channel
    it('should return 404 for a non-existent channel', (done) => {
        chai.request(server)
            .delete('/manageChannel/delete/999')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').eql('Channel not found');
                done();
            });
    });

    //Ban user
    it('should ban a user from a channel', (done) => {
        chai.request(server)
            .post('/manageChannel/ban')
            .send({ channelId: 1, username: 'testuser', reason: 'spamming' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').eql('User banned successfully');
                done();
            });
    });

    //Get banned users
    it('should fetch all banned users', (done) => {
        chai.request(server)
            .get('/manageChannel/bannedUsers')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    //Get channels
    it('should fetch all channels', (done) => {
        chai.request(server)
            .get('/manageChannel')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

});
