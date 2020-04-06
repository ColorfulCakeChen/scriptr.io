//response.setHeader("Content-Type", "application/javascript;charset=UTF-8");
response.setHeader("Cache-Control", "public, max-age=120");
response.addHeaders(configuration.crossDomainHeaders);
response.write("var theTestJS_ByScript = 0;\n");
response.write("//alert(\"theTestJS_ByScript = \" + theTestJS_ByScript);");
response.close();
