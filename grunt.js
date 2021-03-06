module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-shell');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'shell:clear lint shell:nodeunit_simple'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        strict:false,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
      globals: {
        exports: true
      }
    },
    shell:{
      clear: {//--reporter minimal
        command: 'clear',
        stdout: true,
        stderr: true,
        failOnError:false,
        warnOnError: true
      },

      nodeunit_simple: {//--reporter minimal
        command: './node_modules/nodeunit/bin/nodeunit --reporter skip_passed test/*.js',
        stdout: true,
        stderr: true,
        failOnError:false,
        warnOnError: true
      },

      ci: {
        command: './node_modules/nodeunit/bin/nodeunit test/*.js',
        stdout: true,
        stderr: true,
        failOnError:true,
        warnOnError: true
      },
      doxx:{//
        command:'./node_modules/doxx/bin/doxx --template docs/template.jade --source lib --target docs',
        stdout:true,
        stderr:true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint shell:doxx shell:nodeunit_simple');
  grunt.registerTask('test', 'lint shell:ci');
};
