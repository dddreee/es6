function testable(bool){
    return function (target){
        target.istest = bool;
    }
}

@testable(true)
class A {

}
console.log(A.istest);