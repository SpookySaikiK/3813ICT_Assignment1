const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

describe('Request Management Routes', () => {
    let groupId = 1;

    //Submitting a join or admin rights request
    describe('POST /request', () => {
        it('should submit a join group request successfully', (done) => {
            chai.request(server)
                .post('/manageRequests/request')
                .send({
                    groupId: groupId,
                    username: 'testuser',
                    reason: 'has requested to join the group'
                })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('message').eql('Request submitted successfully');
                    done();
                });
        });

        it('should return 400 for an invalid reason', (done) => {
            chai.request(server)
                .post('/manageRequests/request')
                .send({
                    groupId: groupId,
                    username: 'testuser',
                    reason: 'invalid reason'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('message').eql('Invalid reason provided');
                    done();
                });
        });

        it('should not submit a duplicate request', (done) => {
            chai.request(server)
                .post('/manageRequests/request')
                .send({
                    groupId: groupId,
                    username: 'testuser',
                    reason: 'has requested to join the group'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('message').eql('Request already exists');
                    done();
                });
        });
    });

    //Approving a request
    describe('POST /approve', () => {
        it('should approve a request and add user to group', (done) => {
            chai.request(server)
                .post('/manageRequests/approve')
                .send({
                    groupId: groupId,
                    username: 'testuser'
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').eql('Request approved successfully');
                    done();
                });
        });

        it('should return 404 for a non-existent request', (done) => {
            chai.request(server)
                .post('/manageRequests/approve')
                .send({
                    groupId: groupId,
                    username: 'nonexistentuser'
                })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message').eql('Request not found');
                    done();
                });
        });

        before((done) => {
            chai.request(server)
                .post('/manageRequests/request')
                .send({
                    groupId: groupId,
                    username: 'nonUser',
                    reason: 'has requested to join the group'
                })
                .end((err, res) => {
                    done();
                });
        });

        it('should return 404 if the user does not exist', (done) => {
            chai.request(server)
                .post('/manageRequests/approve')
                .send({
                    groupId: groupId,
                    username: 'nonUser'
                })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message').eql('No such user exists');
                    done();
                });
        });
    });

    //Rejecting a request
    describe('POST /reject', () => {
        before((done) => {
            chai.request(server)
                .post('/manageRequests/request')
                .send({
                    groupId: groupId,
                    username: 'testuser',
                    reason: 'has requested to join the group'
                })
                .end((err, res) => {
                    done();
                });
        });

        it('should reject a request successfully', (done) => {
            chai.request(server)
                .post('/manageRequests/reject')
                .send({
                    groupId: groupId,
                    username: 'testuser'
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').eql('Request rejected successfully');
                    done();
                });
        });

        it('should return 404 for a non-existent request', (done) => {
            chai.request(server)
                .post('/manageRequests/reject')
                .send({
                    groupId: groupId,
                    username: 'nonexistentuser'
                })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message').eql('Request not found');
                    done();
                });
        });
    });


    //Get all requests for a specific group
    describe('GET /:groupId', () => {
        it('should fetch all requests for a specific group', (done) => {
            chai.request(server)
                .get(`/manageRequests/${groupId}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });
});
