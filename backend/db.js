// 간단한 in-memory 데이터베이스
const users = new Map();
const projects = new Map();

let userIdCounter = 1;
let projectIdCounter = 1;

module.exports = {
  // Users
  createUser(username, email, password) {
    const id = userIdCounter++;
    const user = { id, username, email, password, createdAt: new Date() };
    users.set(id, user);
    users.set(`email:${email}`, user);
    users.set(`username:${username}`, user);
    return user;
  },
  
  getUserByEmail(email) {
    return users.get(`email:${email}`);
  },
  
  getUserById(id) {
    return users.get(id);
  },
  
  // Projects
  createProject(userId, name, data) {
    const id = projectIdCounter++;
    const project = {
      id,
      userId,
      name,
      data: JSON.stringify(data),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    projects.set(id, project);
    return project;
  },
  
  getProjectsByUserId(userId) {
    return Array.from(projects.values())
      .filter(p => p.userId === userId);
  },
  
  getProjectById(id) {
    return projects.get(id);
  },
  
  updateProject(id, data) {
    const project = projects.get(id);
    if (project) {
      project.data = JSON.stringify(data);
      project.updatedAt = new Date();
      projects.set(id, project);
    }
    return project;
  },
  
  deleteProject(id) {
    return projects.delete(id);
  }
};