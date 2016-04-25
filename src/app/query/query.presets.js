angular.module('neograph.query.presets',[])
.factory("queryPresets", function () {

    return {
        "Schema":{
            q: "match (n:Schema) optional match (n)-[r]-(m:Schema) return n,r,m"
        }
        ,
        "AddedRecently": {

            q: "match (n:Global) where n.created is not null return n order by n.created desc limit 100"

        },  "AddedRecentlyPictures": {
            //MATCH (p:Label) - [:ASSOCIATED_WITH|:PART_OF|:FOUNDS|:LEADS|:MEMBER_OF|:REPRESENTS] - (g:Group), (p) -- (i:Picture) where ID(g) = " + n.id + " return p.Name,collect(i)[0..5],count(*) as count order by p.Name
            q: "MATCH  (p:Label) -- (i:Picture) where p.created is not null return p.created,collect(i)[0..5],count(*) as count  order by p.created desc limit 500"

        },
        "Overview": {
            q: "match (n) - [r] - (m) where (n:Global and m:Global) and (n.Status is null or n.Status > 6) and (m.Status is null or m.Status > 6) and not (n-[:INSTANCE_OF]-m) RETURN r"
        }
        ,
        "OverViewDense": {
            q: "match (n) - [r] - (m) where (n:Global and m:Global) and (n.Status is null or n.Status > 3) and (m.Status is null or m.Status > 3) and not (n-[:INSTANCE_OF]-m) RETURN r"
        }
        ,
        "British Influence": {
            q: "MATCH (c:Global)-[r]-(d:Global) where (c:English or c:Scottish) and not (c-[:INSTANCE_OF]-d) and not d.Lookup='English' and not c.Lookup='English'  return c,d,r"
        },
        "British Only": {
            q: "MATCH (c:Global)-[r]-(d:Global) where (c:English or c:Scottish) and  (d:English or d:Scottish) and not (c-[:INSTANCE_OF]-d) and not d.Lookup='English' and not c.Lookup='English'  return c,d,r"
            ,
            connectAll: true
        }
           ,
        "French Only": {
            q: "MATCH (c:Global:French)-[r]-(d:Global:French) where  not (c-[:INSTANCE_OF]-d) and not d.Lookup='French' and not c.Lookup='French'  return c,d,r"
             ,
            connectAll: true
        }
        ,
        "French Painter influence": {
            q: "MATCH (c:Global:French:Painter)-[r]-(d:Painter) where not (c-[:INSTANCE_OF]-d) and not d.Lookup='French' and not c.Lookup='French'  return c,d,r"
                    ,
            connectAll: true
        }
        ,
        "Cezanne 3 gen": {
            q: "MATCH (c {Lookup:'Cezanne'})-[r]-(d:Painter)  -[s]-(e:Painter)  -[t]-(f:Painter) return c,d,e,f,r,s,t"
            ,
            connectAll: true
        }
            ,
        "Cezanne 3 gen outbound": {
            q: "MATCH (c {Lookup:'Cezanne'})-[r]->(d:Painter)  -[s]->(e:Painter)  -[t]->(f:Painter) return c,d,e,f,r,s,t"
            ,
            connectAll: true
        }
            ,
        "Cezanne 3 gen inbound": {
            q: "MATCH (c {Lookup:'Cezanne'})<-[r]-(d:Painter)  <-[s]-(e:Painter)  <-[t]-(f:Painter) return c,d,e,f,r,s,t"
                    ,
            connectAll: true
        }
               ,
        "French-English Painters": {
            q: "MATCH (c:Global:French:Painter)-[r]-(d:Global:English:Painter) where  not (c-[:INSTANCE_OF]-d) and not d.Lookup='French' and not c.Lookup='French'  return c,d,r"
             ,
            connectAll: true
        }
                 ,
        "German": {
            q: "MATCH (c:Global:German)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) and not d.Lookup='German' and not c.Lookup='German'  return c,d,r"
        }
                  ,
        "NorthernEurope": {
            q: "MATCH (c:Global)-[r]-(d:Global) where (c:NorthernEurope or c:German or c:Dutch or c:English or c:Scottish) and  (d:NorthernEurope or d:German or d:Dutch or d:English or d:Scottish) and not c:Provenance and not d:Provenance and not (c-[:INSTANCE_OF]-d)   return c,d,r"
        }
                 ,
        "Italian": {
            q: "MATCH (c:Global:Italian)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) and not d.Lookup='Italian' and not c.Lookup='Italian'  return c,d,r"
        }
                 ,
        "Spanish": {
            q: "MATCH (c:Global:Spanish)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) and not d.Lookup='Spanish' and not c.Lookup='Spanish'  return c,d,r"
        }
                  ,
        "American": {
            q: "MATCH (c:Global:American)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) and not d.Lookup='American' and not c.Lookup='American'  return c,d,r"
        }
                 ,
        "Pop": {
            q: "match (n {Lookup:'Pop'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p"
        }
               ,
        "Impressionism": {
            q: "match (n {Lookup:'Impressionist'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p"
            ,
            connectAll: true
        }
               ,
        "Landscape": {
            q: "MATCH (c:Global:Landscape)-[r]-(d:Global)  where not (c-[:INSTANCE_OF]-d)  and not d.Lookup='Landscape' and (d:Landscape or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r"
        }
               ,
        "Modern": {
            q: "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) and c.YearTo > 1870  and d.YearTo > 1870 return c,d,r"
        }
                  ,
        "Rennaissance": {
            q: "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) and c.YearTo > 1400 and c.YearTo<1700 and d.YearTo > 1400 and d.YearTo<1700 return c,d,r"
        }


        // $scope.query =;

        // $scope.query = "match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF|:ASSOCIATED_WITH|:INSPIRES|:ADMIRES|:FROM|:DEVELOPS|:ANTICIPATES|:FOUNDS|:LEADS|:WORKS_IN] - (m) where (n:Global and m:Global) and (n:Greatest or n:Group or n:Theme or n:School or n:Iconography or n:Provenance) and (m:Greatest or m:Group  or m:Theme or m:School or m:Iconography or m:Provenance) RETURN r";//"match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF] - (m) where (n:Greatest or n:Group) and (m:Greatest or m:Group) RETURN r";

        //BRITSH
        // $scope.query = ;

        //IMPRESSIONISM
        // MATCH (c:Global:Impressionist)-[r]-(d:Global:Impressionist) where  not (c-[:INSTANCE_OF]-d)   return c,d,r
        //need to use connect all:
        //  match (n {Lookup:'Impressionism'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) return n,r,m,s,p
        //match (n {Lookup:'Impressionism'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p
        //only follow links to next gen for above given weight ?

        //LANDSCAPE
        //"MATCH (c:Global:Landscape)-[r]-(d:Global)  where not (c-[:INSTANCE_OF]-d)  and not d.Lookup='Landscape' and (d:Landscape or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r"

        //DATE FILTER
        //   $scope.query =

        //  var initQueryText = "match (n:Greatest) - [r:INFLUENCES] - (m:Greatest) RETURN r";//"match (n:Painter) return n.Name"

        //   $scope.query = "match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF|:ASSOCIATED_WITH|:INSPIRES|:ADMIRES|:FROM|:DEVELOPS|:ANTICIPATES|:FOUNDS|:LEADS|:WORKS_IN] - (m) where (n:Global and m:Global and n.YearTo is not null and m.YearTo is not null) and (n:Great or n:Group or n:School  or n:Period) and (m:Great or m:Group  or m:School or m:Period) RETURN r";

        // $scope.query = "match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF|:ASSOCIATED_WITH|:INSPIRES|:ADMIRES|:FROM|:DEVELOPS|:ANTICIPATES|:FOUNDS|:LEADS|:WORKS_IN] - (m) where (n:Global and m:Global and n.YearTo is not null and m.YearTo is not null) and (n:Greatest or n:Group or n:Theme or n:School or n:Iconography or n:Provenance) and (m:Greatest or m:Group  or m:Theme or m:School or m:Iconography or m:Provenance) RETURN r";




    }


})