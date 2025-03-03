class SphereTex {
  constructor(latDiv=12, longDiv=12){
    this.positions=[];
    this.normals=[];
    this.uvs=[];

    this.vbuf=null;
    this.nbuf=null;
    this.ubuf=null;

    this.initSphere(latDiv, longDiv);
  }

  initSphere(latCnt, longCnt){
    for(let lat=0; lat<latCnt; lat++){
      let phi1=Math.PI*(lat/latCnt);
      let phi2=Math.PI*((lat+1)/latCnt);

      for(let lng=0; lng<longCnt; lng++){
        let theta1=2.0*Math.PI*(lng/longCnt);
        let theta2=2.0*Math.PI*((lng+1)/longCnt);

        let p1=this.getXYZ(phi1, theta1);
        let p2=this.getXYZ(phi1, theta2);
        let p3=this.getXYZ(phi2, theta1);
        let p4=this.getXYZ(phi2, theta2);

        // tri1 => p1,p2,p3
        this.positions.push(p1[0],p1[1],p1[2]);
        this.positions.push(p2[0],p2[1],p2[2]);
        this.positions.push(p3[0],p3[1],p3[2]);

        // tri2 => p3,p2,p4
        this.positions.push(p3[0],p3[1],p3[2]);
        this.positions.push(p2[0],p2[1],p2[2]);
        this.positions.push(p4[0],p4[1],p4[2]);

        let n1=this.normalize(p1);
        let n2=this.normalize(p2);
        let n3=this.normalize(p3);
        let n4=this.normalize(p4);

        this.normals.push(n1[0],n1[1],n1[2]);
        this.normals.push(n2[0],n2[1],n2[2]);
        this.normals.push(n3[0],n3[1],n3[2]);
        this.normals.push(n3[0],n3[1],n3[2]);
        this.normals.push(n2[0],n2[1],n2[2]);
        this.normals.push(n4[0],n4[1],n4[2]);

        let uv1=this.getUV(phi1,theta1);
        let uv2=this.getUV(phi1,theta2);
        let uv3=this.getUV(phi2,theta1);
        let uv4=this.getUV(phi2,theta2);

        this.uvs.push(uv1[0], uv1[1]);
        this.uvs.push(uv2[0], uv2[1]);
        this.uvs.push(uv3[0], uv3[1]);
        this.uvs.push(uv3[0], uv3[1]);
        this.uvs.push(uv2[0], uv2[1]);
        this.uvs.push(uv4[0], uv4[1]);
      }
    }
  }

  getXYZ(phi, theta){
    let x=Math.sin(phi)*Math.cos(theta);
    let y=Math.cos(phi);
    let z=Math.sin(phi)*Math.sin(theta);
    return [x,y,z];
  }

  normalize(v){
    let len=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
    if(len<1e-8) return [0,0,0];
    return [v[0]/len,v[1]/len,v[2]/len];
  }

  getUV(phi,theta){
    let u = theta/(2.0*Math.PI);
    let v = phi/Math.PI;
    return [u,v];
  }

  render(){
    if(!this.vbuf){
      this.vbuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.positions),gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_Position);

    if(!this.nbuf){
      this.nbuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,this.nbuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.normals),gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_Normal);

    if(!this.ubuf){
      this.ubuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,this.ubuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.uvs),gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_UV,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_UV);

    let n=this.positions.length/3;
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
}
