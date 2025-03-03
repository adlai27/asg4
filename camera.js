class Camera {
  constructor(){
    this.eye   = new Vector3([0,2,8]);
    this.at    = new Vector3([0,2,0]);
    this.up    = new Vector3([0,1,0]);

    this.yaw   = 0;
    this.pitch = 0;
    this.speed = 0.2;

    this.updateAt();
  }

  updateAt(){
    let radYaw   = this.yaw   * Math.PI/180.0;
    let radPitch = this.pitch * Math.PI/180.0;

    let fx = Math.sin(radYaw) * Math.cos(radPitch);
    let fy = Math.sin(radPitch);
    let fz = -Math.cos(radYaw)* Math.cos(radPitch);

    this.at.elements[0] = this.eye.elements[0] + fx;
    this.at.elements[1] = this.eye.elements[1] + fy;
    this.at.elements[2] = this.eye.elements[2] + fz;
  }

  forward(){
    let f = new Vector3(this.at.elements);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
  }
  backward(){
    let f = new Vector3(this.eye.elements);
    f.sub(this.at);
    f.normalize();
    f.mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
  }
  left(){
    let forward = new Vector3(this.at.elements);
    forward.sub(this.eye);
    forward.normalize();

    let side = cross(this.up, forward);
    side.normalize();
    side.mul(this.speed);

    this.eye.add(side);
    this.at.add(side);
  }
  right(){
    let forward = new Vector3(this.eye.elements);
    forward.sub(this.at);
    forward.normalize();

    let side = cross(this.up, forward);
    side.normalize();
    side.mul(this.speed);

    this.eye.add(side);
    this.at.add(side);
  }
  upward(){
    this.eye.elements[1] += this.speed;
    this.at.elements[1] += this.speed;
  }
  downward(){
    this.eye.elements[1] -= this.speed;
    this.at.elements[1] -= this.speed;
  }
  rotLeft(angle=5){
    this.yaw -= angle;
    this.updateAt();
  }
  rotRight(angle=5){
    this.yaw += angle;
    this.updateAt();
  }
  tilt(angle=5){
    this.pitch += angle;
    if(this.pitch > 89)  this.pitch = 89;
    if(this.pitch < -89) this.pitch = -89;
    this.updateAt();
  }
}

// Cross-product helper
function cross(u,v){
  return new Vector3([
    u.elements[1]*v.elements[2] - u.elements[2]*v.elements[1],
    u.elements[2]*v.elements[0] - u.elements[0]*v.elements[2],
    u.elements[0]*v.elements[1] - u.elements[1]*v.elements[0]
  ]);
}
