class Cylinder {
    constructor(segments = 12) {
      this.color      = [1, 1, 1, 1];  
      this.matrix     = new Matrix4();
      this.textureNum = -2;           
      this.segments   = segments;
  
      this.vertices = [];  
      this.uvs      = [];  
  
      this.initVerts();
    }
  
    initVerts() {
      let r     = 0.5;
      let yTop  = 0.5;
      let yBot  = -0.5;
      let dTheta = (2 * Math.PI) / this.segments;
  
      for (let i = 0; i < this.segments; i++) {
        // angles for segment i and segment i+1
        let th1 = i * dTheta;
        let th2 = (i + 1 === this.segments) ? 0 : (i + 1) * dTheta;
  
        let x1 = r * Math.cos(th1), z1 = r * Math.sin(th1);
        let x2 = r * Math.cos(th2), z2 = r * Math.sin(th2);
  
        // Triangle: center + (x1,yTop,z1) + (x2,yTop,z2)
        this.vertices.push(
          0,   yTop, 0,
          x1,  yTop, z1,
          x2,  yTop, z2
        );
        this.uvs.push(
          0.5, 0.5,
          0.5, 0.5,
          0.5, 0.5
        );
  
        // Triangle: center + (x2,yBot,z2) + (x1,yBot,z1)
        this.vertices.push(
          0,    yBot, 0,
          x2,   yBot, z2,
          x1,   yBot, z1
        );
        this.uvs.push(
          0.5, 0.5,
          0.5, 0.5,
          0.5, 0.5
        );
  
        //  (x1,yTop,z1) -> (x2,yTop,z2) -> (x1,yBot,z1)
        this.vertices.push(
          x1, yTop, z1,
          x2, yTop, z2,
          x1, yBot, z1
        );
        this.uvs.push(
          0,0,  1,0,  0,1
        );
  
        this.vertices.push(
          x2, yTop, z2,
          x2, yBot, z2,
          x1, yBot, z1
        );
        this.uvs.push(
          1,0,  1,1,  0,1
        );
      }
    }
  
    render() {
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      gl.uniform1i(u_whichTexture, this.textureNum);
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
  
      drawTriangle3DUV(
        new Float32Array(this.vertices),
        new Float32Array(this.uvs)
      );
    }
  }
  