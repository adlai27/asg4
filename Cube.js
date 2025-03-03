class CubeTex {
  constructor(){
    // 36 vertex positions
    this.positions = new Float32Array([
      // front face
      0,0,0, 1,1,0, 1,0,0,
      0,0,0, 0,1,0, 1,1,0,
      // back face
      0,0,1, 1,0,1, 1,1,1,
      0,0,1, 1,1,1, 0,1,1,
      // left face
      0,0,0, 0,0,1, 0,1,1,
      0,0,0, 0,1,1, 0,1,0,
      // right face
      1,0,0, 1,1,1, 1,0,1,
      1,0,0, 1,1,0, 1,1,1,
      // top face
      0,1,0, 1,1,0, 1,1,1,
      0,1,0, 1,1,1, 0,1,1,
      // bottom face
      0,0,0, 1,0,0, 1,0,1,
      0,0,0, 1,0,1, 0,0,1
    ]);

    // face normals (outward)
    this.normals = new Float32Array([
      // front
      0,0,-1, 0,0,-1, 0,0,-1,
      0,0,-1, 0,0,-1, 0,0,-1,
      // back
      0,0,1, 0,0,1, 0,0,1,
      0,0,1, 0,0,1, 0,0,1,
      // left
      -1,0,0, -1,0,0, -1,0,0,
      -1,0,0, -1,0,0, -1,0,0,
      // right
      1,0,0, 1,0,0, 1,0,0,
      1,0,0, 1,0,0, 1,0,0,
      // top
      0,1,0, 0,1,0, 0,1,0,
      0,1,0, 0,1,0, 0,1,0,
      // bottom
      0,-1,0, 0,-1,0, 0,-1,0,
      0,-1,0, 0,-1,0, 0,-1,0
    ]);

    // naive UV
    this.uvs = new Float32Array([
      // front
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // back
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,
      // left
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,
      // right
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // top
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,
      // bottom
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1
    ]);

    this.vbuf = null;
    this.nbuf = null;
    this.ubuf = null;
  }

  render(){
    if(!this.vbuf){
      this.vbuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if(!this.nbuf){
      this.nbuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    if(!this.ubuf){
      this.ubuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ubuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, this.positions.length/3);
  }
}


class CubeInsideOut {
  constructor(){
    this.positions = new Float32Array([
      // front face 
      0,0,0, 1,0,0, 1,1,0,
      0,0,0, 1,1,0, 0,1,0,

      // back face 
      0,0,1, 1,1,1, 1,0,1,
      0,0,1, 0,1,1, 1,1,1,

      // left face 
      0,0,0, 0,1,0, 0,1,1,
      0,0,0, 0,1,1, 0,0,1,

      // right face 
      1,0,0, 1,0,1, 1,1,1,
      1,0,0, 1,1,1, 1,1,0,

      // top face 
      0,1,0, 1,1,1, 1,1,0,
      0,1,0, 0,1,1, 1,1,1,

      // bottom face 
      0,0,0, 1,0,1, 1,0,0,
      0,0,0, 0,0,1, 1,0,1
    ]);

    // invert face normals
    this.normals = new Float32Array([
      // front 
      0,0,1, 0,0,1, 0,0,1,
      0,0,1, 0,0,1, 0,0,1,

      // back 
      0,0,-1, 0,0,-1, 0,0,-1,
      0,0,-1, 0,0,-1, 0,0,-1,

      // left 
      1,0,0, 1,0,0, 1,0,0,
      1,0,0, 1,0,0, 1,0,0,

      // right 
      -1,0,0, -1,0,0, -1,0,0,
      -1,0,0, -1,0,0, -1,0,0,

      // top 
      0,-1,0, 0,-1,0, 0,-1,0,
      0,-1,0, 0,-1,0, 0,-1,0,

      // bottom 
      0,1,0, 0,1,0, 0,1,0,
      0,1,0, 0,1,0, 0,1,0
    ]);

    this.uvs = new Float32Array([
      // front
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,
      // back
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // left
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,
      // right
      0,0, 0,1, 1,1,
      0,0, 1,1, 1,0,
      // top
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,
      // bottom
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1
    ]);

    this.vbuf = null;
    this.nbuf = null;
    this.ubuf = null;
  }

  render(){
    if(!this.vbuf){
      this.vbuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if(!this.nbuf){
      this.nbuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    if(!this.ubuf){
      this.ubuf=gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ubuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, this.positions.length/3);
  }
}
