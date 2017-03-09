import handroll from 'handroll'

SOURCEMAPPING_URL = 'sourceMappingURL'


createHandroll = (args, opts = {}, logger) ->
  log = logger.create('preprocessor.handroll')

  (content, file, done) ->
    log.debug 'Processing "%s".', file.originalPath
    try
      opts.entry = file.originalPath
      handroll.bundle(opts).then (bundle) ->
        {code, map} = bundle.generate opts
        if opts.sourceMap == 'inline'
          code += '\n//# ' + SOURCEMAPPING_URL + '=' + map.toUrl()
        if opts.sourceMap
          file.sourceMap = map
        done null, code
      .catch (error) ->
        log.error '%s\n at %s\n%s', error.message, file.originalPath, error.stack
        done error
    catch error
      log.error '%s\n at %s', error.message, file.originalPath
      done error

createHandroll.$inject = [
  'args'
  'config.handroll'
  'logger'
]

export default {
  'preprocessor:handroll': ['factory', createHandroll]
}
