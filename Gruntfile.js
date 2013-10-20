module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true
      }
    },
    watch: {
      karma: {
        files: ['app/*.js', 'test/**/*.js'],
        tasks: ['karma:unit:run']
      }
    },
    browserify: {
      app: {
        files: {
          '.tmp/browserdb.js': ['app/db.js']
        }
      },
      dist: {
        files: {
          'dist/browserdb.js': ['app/db.js']
        }
      }
    },
    clean: {
      app: ['.tmp'],
      dist: ['dist']
    }
  });

  grunt.registerTask('default', [
    'karma:unit:start',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'browserify:dist'
  ]);
};
