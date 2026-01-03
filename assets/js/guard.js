(function(){
  if(window.MBCCAuth && typeof window.MBCCAuth.ensureAccess === "function"){
    window.MBCCAuth.ensureAccess();
  }
})();