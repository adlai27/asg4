
class Point {
    constructor() {
      this.type     = "point";
      this.position = [0.0, 0.0];
      this.color    = [1.0, 1.0, 1.0, 1.0];
      this.size     = 10.0;
    }
  
    render() {
      // Use uniform for color
      g_gl.uniform4f(g_uFragColor,
                     this.color[0],
                     this.color[1],
                     this.color[2],
                     this.color[3]);
      // Use uniform for point size
      g_gl.uniform1f(g_uPointSize, this.size);
  
      // Draw a single point (no buffer needed)
      g_gl.disableVertexAttribArray(g_aPosition);
      g_gl.vertexAttrib3f(g_aPosition, this.position[0], this.position[1], 0.0);
  
      g_gl.drawArrays(g_gl.POINTS, 0, 1);
    }
  }
  