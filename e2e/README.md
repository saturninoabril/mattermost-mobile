

Should have the following setup to automatically start Android emulator
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$PATH
```
Note: Order of path is important. `emulator` should come first before `tools`.
