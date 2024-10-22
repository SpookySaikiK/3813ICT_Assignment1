const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const fs = require('fs');
const path = require('path');
const { expect } = chai;

chai.use(chaiHttp);

const groupsFilePath = path.join(__dirname, '../data/groups.json');
const usersFilePath = path.join(__dirname, '../data/users.json');

//Reset groups and users
const resetGroups = () => {
    fs.writeFileSync(groupsFilePath, JSON.stringify([]));
};

const resetUsers = () => {
    const defaultUsers = [
        { id: 1, username: 'admin', roles: ['groupAdmin'] },
        { id: 2, username: 'testuser', roles: [] }
    ];
    fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers));
};

describe('Group Management Routes', () => {
    beforeEach(() => {
        resetGroups();
        resetUsers();
    });

    //Create Group
    it('should create a new group', (done) => {
        chai.request(server)
            .post('/manageGroup/create')
            .send({ name: 'Test Group', ownerName: 'admin', adminId: 1 })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('message').eql('Group created successfully');
                expect(res.body).to.have.property('group').that.is.an('object');
                done();
            });
    });

    //Get groups
    it('should get all groups', (done) => {
        chai.request(server)
            .get('/manageGroup')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    //Delete group
    it('should delete an existing group', (done) => {
        chai.request(server)
            .post('/manageGroup/create')
            .send({ name: 'Test Group', ownerName: 'admin', adminId: 1 })
            .end((err, res) => {
                const groupId = res.body.group.id;
                chai.request(server)
                    .delete(`/manageGroup/delete/${groupId}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('message').eql('Group deleted successfully');
                        done();
                    });
            });
    });

    //Delete non existent group(fail)
    it('should return 404 for a non-existent group when trying to delete', (done) => {
        chai.request(server)
            .delete('/manageGroup/delete/999')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').eql('Group not found');
                done();
            });
    });

    //Leave group
    it('should allow a user to leave a group', (done) => {
        chai.request(server)
            .post('/manageGroup/create')
            .send({ name: 'Test Group', ownerName: 'admin', adminId: 1 })
            .end((err, res) => {
                const groupId = res.body.group.id;
                chai.request(server)
                    .post('/manageGroup/leave')
                    .send({ groupId, userId: 1 })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('message').eql('User left the group successfully');
                        done();
                    });
            });
    });

    //Leave non existent group(fail)
    it('should return 404 when leaving a non-existent group', (done) => {
        chai.request(server)
            .post('/manageGroup/leave')
            .send({ groupId: 999, userId: 1 })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').eql('Group not found');
                done();
            });
    });

    //Add user to group
    it('should add a user to a group', (done) => {
        chai.request(server)
            .post('/manageGroup/create')
            .send({ name: 'Test Group', ownerName: 'admin', adminId: 1 })
            .end((err, res) => {
                const groupId = res.body.group.id;
                chai.request(server)
                    .post('/manageGroup/addMember')
                    .send({ groupId, username: 'testuser' })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('message').eql('User added to group successfully');
                        done();
                    });
            });
    });

    //Add user to group(Not found group)
    it('should return 404 if the group is not found when adding a member', (done) => {
        chai.request(server)
            .post('/manageGroup/addMember')
            .send({ groupId: 999, username: 'testuser' })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').eql('Group not found');
                done();
            });
    });

    //Remove user from group
    it('should remove a user from a group', (done) => {
        chai.request(server)
            .post('/manageGroup/create')
            .send({ name: 'Test Group', ownerName: 'admin', adminId: 1 })
            .end((err, res) => {
                const groupId = res.body.group.id;
    
                // First, add the user to the group
                chai.request(server)
                    .post('/manageGroup/addMember')
                    .send({ groupId, username: 'testuser' })
                    .end(() => {
                        // Then try to remove the user from the group
                        chai.request(server)
                            .post('/manageGroup/removeMember')
                            .send({ groupId, username: 'testuser' })
                            .end((err, res) => {
                                expect(res).to.have.status(200);
                                expect(res.body).to.have.property('message').eql('User removed from group successfully');
                                done();
                            });
                    });
            });
    });
    
    //Remove user from group(group not found)
    it('should return 404 if the group is not found when removing a member', (done) => {
        chai.request(server)
            .post('/manageGroup/removeMember')
            .send({ groupId: 999, username: 'testuser' })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').eql('Group not found');
                done();
            });
    });

    //Promote user to groupadmin
    it('should promote a user to group admin', (done) => {
        chai.request(server)
            .post('/manageGroup/promote')
            .send({ username: 'testuser', role: 'groupAdmin' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').eql('User testuser promoted to groupAdmin successfully!');
                done();
            });
    });

    //Promote non existent user(fail)
    it('should return 404 when trying to promote a non-existent user', (done) => {
        chai.request(server)
            .post('/manageGroup/promote')
            .send({ username: 'nonexistentuser', role: 'groupAdmin' })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').eql('No such user exists');
                done();
            });
    });
});
