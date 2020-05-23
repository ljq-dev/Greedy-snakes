//定义一些全局变量
var sw = 20;  //方块宽
var sh = 20;  //方块高
var tr = 25;  //行
var td = 25;  //列

var snake = null; //蛇
var food = null;  //食物
var game = null; //游戏

//方块构造函数
function Square(x, y, classname){
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;
    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.getElementsByClassName('snakeWrap')[0];
}

//创建方块
Square.prototype.create = function (){
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.parent.appendChild(this.viewContent);
}
//销毁方块
Square.prototype.remove = function (){
    this.parent.removeChild(this.viewContent);

}

//蛇
function Snake(){
    this.head = null;  //存蛇头
    this.tail = null;  //存蛇尾
    this.pos = [];     //二维数组，用来存储蛇身上方块的位置
    this.directionNum = {
        left: {
            x:-1,
            y:0,
            rotate:180
        },
        right: {
            x:1,
            y:0,
            rotate:0
        },
        up: {
            x:0,
            y:-1,
            rotate:-90
        },
        down: {
            x:0,
            y:1,
            rotate:90
        }
    };   //用个对象存储蛇的方向  ((不改变的话，就设置一个默认值放再初始化中))
}
Snake.prototype.init = function (){
    //蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2,0]);

    //蛇身1
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]);

    //蛇身2
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0,0]);

    //蛇形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;
    
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //默认方向(向右走)
    this.direction = this.directionNum.right;
}
//获取蛇下一步到达的方块的信息（要走，要吃，要撞墙，要撞自己）
Snake.prototype.getNextPos = function (){
    var nextPos = [
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]
    //下一个是自己，游戏结束
    var selfKey = false;
    this.pos.forEach(el => {

        if(el[0] == nextPos[0] && el[1] == nextPos[1]){
            selfKey = true;
        }
    })
    if(selfKey){
        this.strategies.die.call(this);
        return;
    }
    //下一个是围墙，游戏结束
    if(nextPos[0]<0 || nextPos[0]>td-1 || nextPos[1]<0 || nextPos[1]>tr-1){
        this.strategies.die.call(this);
        return;
    }

    //下一个是食物，要吃
    if(food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
        //说明碰到食物了，要吃
        this.strategies.eat.call(this);
        return;

    }

    //下一个什么也不是，要走
    this.strategies.move.call(this);
}
//处理碰撞后的事件(strategies 战略，计谋)
Snake.prototype.strategies = {
    move: function (para){
        //走  (this指向Snake)

        var newBody = new Square(this.head.x/sw, this.head.y/sh, 'snakeBody');
        newBody.last = null;
        newBody.next = this.head.next;
        newBody.next.last = newBody;  //snakeBody1 的last需要重新指向

        this.head.remove();
        newBody.create();
        

        var newHead = new Square(this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y,
            'snakeHead');
        newHead.last = null;
        newHead.next = newBody;
        newBody.last = newHead;

        //this.pos里添加新蛇头的位置（先添蛇头位置，再存蛇头不要弄错，引起不必要的麻烦）
        this.pos.unshift([this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y])

        this.head = newHead;  //注意上面的this.head，当要压入this.pos时，不要弄混了，
        // this.head = newHead一定要放在下面

        //每次走，就相当于创建蛇头，就改变蛇头的方向
        newHead.viewContent.style.transform = 'rotate('+ this.direction.rotate+'deg)';

        newHead.create(); ////

        //判断蛇尾是否要删除，(undefined为false,不传就是undefined,蛇尾要断)
        if(!para){
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();
        }
    },
    eat: function (){
        this.strategies.move.call(this, true);  //true 蛇尾不用断
        // （要使用call改变this指向，不然this.strategies函数里的this的指向是有问题的）
        createFood();
        game.score ++;

    },
    die: function (){
        game.over();
    }
}

snake = new Snake();






//生成食物
function createFood(){
    var x = null;
    var y = null;

    var include = true;
    while(include){
        x = Math.round(Math.random()*(td-1));
        y = Math.round(Math.random()*(tr-1));
        snake.pos.forEach(function (el){
            if(x!=el[0] && y!=el[1]){        
                include = false;
            }
        })
    }
    food = new Square(x,y,'snakeFood');
    food.pos = [x,y];  //创建并存起来

    //单设计模式学一下
    //我们只是创造了一个食物，只是不断改变它的位置
    var foodNode = document.querySelector('.snakeFood')
    if(foodNode){
        foodNode.style.left = x*sw+'px';
        foodNode.style.top = y*sh+'px';
    }else{
        food.create();

    }
    
}



function Game(){
    this.score = 0;   //
    this.timer = null;   //定时器
}
Game.prototype.init = function (){
    snake.init();   //初始化蛇
    createFood();   //生成食物

    document.onkeydown = function (e){
        
        if(e.which == 37 && snake.direction!=snake.directionNum.right){ //我按左键时，此时蛇不应该往右走
            snake.direction = snake.directionNum.left;
        }else if(e.which == 38 && snake.direction!=snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if ( e.which == 39 && snake.direction!=snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if(e.which == 40 && snake.direction!=snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
}
Game.prototype.start = function (){
    this.timer = setInterval(function (){
        snake.getNextPos();
    },200)
}
//游戏结束
Game.prototype.over = function (){
    clearInterval(this.timer);
    alert('你的得分是：'+this.score);
    snakeWrap.innerHTML = '';
    snake = new Snake();
    startBtn.parentNode.style.display = 'block';
    pauseBtn.parentNode.style.display = 'none';

}
game = new Game();

//点击开始游戏
//开始按钮
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function (){
    this.parentNode.style.display = 'none';
    game.init();
}

//蛇div
var snakeWrap = document.querySelector('.snakeWrap');
//停止按钮
var pauseBtn = document.querySelector('.pauseBtn button');

//界面点击时停止
snakeWrap.onclick = function (){
   
    clearInterval(game.timer);
    pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function (){
    this.parentNode.style.display = 'none';
    game.start();
}
