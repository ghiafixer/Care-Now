var gulp = require('gulp'),
    gutil = require('gulp-util'),
    zip = require('gulp-zip'),
    run = require('gulp-run'),
    watch = require('gulp-watch'),
    foreach = require('gulp-foreach');
 
var paths = {
  functionSrc: ['src/**/*'],
  audio: 'audio/**/*'
};

gulp.task('zip', function () {
    return gulp.src('src/**/*', {nodir: true})
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('archives'));
});

gulp.task('test', function () {
  return gulp.src('testIntents/*.test.json')
    .pipe(foreach(function(stream, file){
      console.log("\n\r", '<<<', file.relative, '>>>');
      return run('aws lambda invoke --profile odc --function-name care-now-skill --invocation-type RequestResponse --payload file://testIntents/'+file.relative+' last-intent-test.txt; cat last-intent-test.txt').exec()
        .pipe(gulp.dest('output'));
    }));
  
});

gulp.task('upload-function', ['zip'], function () {
  run('aws lambda update-function-code --profile odc --function-name care-now-skill --zip-file fileb://archives/archive.zip').exec()
    .on('error', gutil.log)
    .pipe(gulp.dest('output'));
});

gulp.task('upload-audio', function () {
  run('aws s3 sync archives/ s3://odc/audio --exclude \'*\' --include \'*.mp3\' --delete --profile odc --acl public-read').exec()
    .on('error', gutil.log)
    .pipe(gulp.dest('output'));
});

gulp.task('watch', function() {
  gulp.watch(paths.functionSrc, ['upload-function']);
  gulp.watch(paths.audio, ['upload-audio']);
});

// ffmpeg -i input.m4a -ab 48k -c mp3 -ac 2 -ar 16000 -af volume=2 audio-02-17-2016.mp3
// ffmpeg -y -i input.m4a -ar 24000 -ab 48k -codec:a libmp3lame -ac 1 audio-02-17-2016.mp3
// ffmpeg -i input.m4a -acodec mp3 -ac 2 -ab 48k -ar 16000 -async 1 -y -f vob audio-02-17-2016.mp3
// ffmpeg -i input.m4a -codec:a libmp3lame -qscale:a 2 -ab 48k -ar 16000 output.mp3

// aws lambda add-permission --function-name care-now-skill --region us-east-1 --statement-id textmeskill --action "lambda:GetFunction" --principal arn:aws:iam::706712623498:user/admin

