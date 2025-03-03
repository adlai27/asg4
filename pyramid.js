class Pyramid {
    constructor(){
      this.color = [1,1,1,1];
      this.matrix = new Matrix4();
      this.textureNum = -2;
      this.verts = [
        // base square (two triangles)
        0.5,0,0.5,   -0.5,0,0.5,   -0.5,0,-0.5,
        0.5,0,0.5,   -0.5,0,-0.5,   0.5,0,-0.5,
        // side1
        0.5,0,0.5,   0,1,0,   -0.5,0,0.5,
        // side2
        -0.5,0,0.5,  0,1,0,   -0.5,0,-0.5,
        // side3
        -0.5,0,-0.5, 0,1,0,   0.5,0,-0.5,
        // side4
        0.5,0,-0.5,  0,1,0,   0.5,0,0.5
      ];
      this.buffer = null;
    }
  
    render(){
      gl.uniform4f(u_FragColor, this.color[0],this.color[1],this.color[2],this.color[3]);
      gl.uniformMatrix4fv(u_ModelMatrix,false,this.matrix.elements);
      gl.uniform1i(u_whichTexture, this.textureNum);
  
      if(!this.buffer){
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.verts),gl.STATIC_DRAW);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
      }
      // positions
      gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
      gl.enableVertexAttribArray(a_Position);
  
      gl.drawArrays(gl.TRIANGLES,0,this.verts.length/3);
      gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
  }